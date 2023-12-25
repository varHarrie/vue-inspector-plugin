import type { UnpluginFactory, UnpluginOptions } from 'unplugin';
import { createUnplugin } from 'unplugin';
import type { Options } from './types';
import fs from 'node:fs/promises';
import path from 'node:path';
import MagicString from 'magic-string';
import { parse, transform } from '@vue/compiler-dom';

const VIRTUAL_ID = '~vue-inspector-plugin';
const EXCLUDED_TAG = ['script', 'style', 'template'];
const DATA_KEY = 'data-v-pos';

type VueQuery = {
  vue?: boolean;
  type?: 'template' | 'script' | 'style';
  lang?: string;
  raw?: boolean;
  jsx?: boolean;
};

function parseId(id: string) {
  const url = new URL(id, 'file://');
  const query = Object.fromEntries(url.searchParams.entries()) as VueQuery;

  if (query.vue != null) query.vue = true;
  if (query.raw != null) query.raw = true;
  if ('lang.jsx' in query || 'lang.tsx' in query) query.jsx = true;

  return {
    pathname: url.pathname,
    query,
  };
}

function insertPosition(code: string, pathname: string) {
  const s = new MagicString(code);
  const ast = parse(code, {
    comments: true,
    getTextMode: (node, parent) => (parent || node.tag === 'template' ? 0 : 2),
  });

  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (
          node.type === 1 &&
          (node.tagType === 0 || node.tagType === 1) &&
          !EXCLUDED_TAG.includes(node.tag)
        ) {
          if (node.loc.source.includes(DATA_KEY)) return;

          const position = node.loc.start.offset + node.tag.length + 1;
          const { line, column } = node.loc.start;

          s.prependLeft(position, ` ${DATA_KEY}="${pathname}:${line}:${column}"`);
        }
      },
    ],
  });

  return s.toString();
}

function hidePosition(code: string) {
  const s = new MagicString(code);

  if (code.includes('_c = _vm._self._c;')) {
    // Vue 2
    s.prepend(`
function __hideVueInspectorPosition(options) {
  if (options?.attrs?.['${DATA_KEY}']) {
    const value = options.attrs['${DATA_KEY}'];
    delete options.attrs['${DATA_KEY}'];
    options.domProps = options.domProps || {};
    options.domProps['__${DATA_KEY}'] = value;
  }
  return options;
}
    `);

    s.replace(/(_c = _vm._self._c;)/g, () => {
      return '_c = (type, options, ...args) => _vm._self._c(type, __hideVueInspectorPosition(options), ...args);';
    });
  } else {
    const names = new Set<string>();
    // Vue 3
    s.replace(/(createElementVNode|createElementBlock|createVNode|createBlock) as _\1,?/g, (match, name) => {
      names.add(name);
      return match.replace(`_${name}`, `__${name}`);
    });

    if (names.size) {
      s.append(`
  function __hideVueInspectorPosition(vnode) {
    if (vnode?.props && '${DATA_KEY}' in vnode.props) {
      const value = vnode.props['${DATA_KEY}'];
      delete vnode.props['${DATA_KEY}'];
      Object.defineProperty(vnode.props, '__${DATA_KEY}', { value, enumerable: false });
    }
    return vnode;
  }
      `);

      Array.from(names).forEach((name) => {
        s.append(
          `\nfunction _${name}(...args) { return __hideVueInspectorPosition(__${name}(...args)) };`,
        );
      });
    }
  }

  return s.toString();
}

function getInspectorScript() {
  return fs.readFile(path.join(__dirname, './inspector/index.js'), 'utf-8');
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const plugins: UnpluginOptions[] = [];
  if (process.env.NODE_ENV !== 'development') return plugins;

  const cwd = options?.cwd || process.cwd().replace(/\\/g, '/');
  const modifierKey = options?.modifierKey || 'ctrl|meta';
  const __VUE_INSPECTOR_OPTIONS__ = JSON.stringify({ cwd, modifierKey, dataKey: DATA_KEY });

  plugins.push({
    name: 'vue-inspector-plugin:insert-position',
    enforce: 'pre',
    transformInclude(id) {
      const { pathname, query } = parseId(id);
      return pathname.endsWith('.vue') && query.type !== 'style' && !query.raw;
    },
    transform(code, id) {
      try {
        const { pathname } = parseId(id);
        return insertPosition(code, pathname);
      } catch (error) {
        return code;
      }
    },
  });

  plugins.push({
    name: 'vue-inspector-plugin:hide-position',
    enforce: 'post',
    transformInclude(id) {
      const { pathname, query } = parseId(id);
      return pathname.endsWith('.vue') && query.type !== 'style' && !query.raw;
    },
    transform(code) {
      try {
        return code.includes(DATA_KEY) && !code.includes('__hideVueInspectorPosition')
          ? hidePosition(code)
          : code;
      } catch (error) {
        return code;
      }
    },
  });

  plugins.push({
    name: 'vue-inspector-plugin',
    resolveId(id) {
      if (id.startsWith('/')) id = id.slice(1);
      return id.startsWith(VIRTUAL_ID) ? `\0${id}` : null;
    },
    loadInclude(id) {
      return id.startsWith(`\0${VIRTUAL_ID}`);
    },
    load(id) {
      if (id === `\0${VIRTUAL_ID}`) {
        return getInspectorScript();
      }

      return '';
    },
    vite: {
      config: (config) => ({
        ...config,
        define: {
          ...config.define,
          'process.env': { __VUE_INSPECTOR_OPTIONS__ },
        },
      }),
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head',
              attrs: {
                type: 'module',
                src: `/${VIRTUAL_ID}`,
              },
            },
          ],
        };
      },
    },
    webpack(compiler) {
      const webpack = require('webpack');

      new webpack.DefinePlugin({
        'process.env.__VUE_INSPECTOR_OPTIONS__': JSON.stringify(__VUE_INSPECTOR_OPTIONS__),
      }).apply(compiler);

      if (webpack.version.startsWith('4.')) {
        if (!compiler.options.entry) compiler.options.entry = {};
        const entry = compiler.options.entry as Record<string, string>;
        entry['vue-inspector-plugin'] = VIRTUAL_ID;
      } else {
        const EntryPlugin = require('webpack/lib/EntryPlugin');
        new EntryPlugin(__dirname, `~vue-inspector-plugin`).apply(compiler);
      }
    },
  });

  return plugins;
};

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
