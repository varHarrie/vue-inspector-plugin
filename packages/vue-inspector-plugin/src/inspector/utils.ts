import { RuntimeOptions } from '../types';

const options = JSON.parse(process.env.__VUE_INSPECTOR_OPTIONS__!) as RuntimeOptions;
const SUPPORTED_MODIFIER_KEYS = ['shift', 'ctrl', 'alt', 'meta'];

type Vue2HtmlElement = HTMLElement & {
  __vue__: Vue2Instance;
};

type Vue3HtmlElement = HTMLElement & {
  __vueParentComponent: Vue3Instance;
};

type VueHtmlElement = Vue2HtmlElement | Vue3HtmlElement;

type MatchedRoute = {
  path: string;
  components: {
    [key: string]: {
      __file: string;
    };
  };
};

type Route = {
  matched: MatchedRoute[];
};

type Vue2Instance = {
  $el: HTMLElement & { [key: string]: unknown };
  $root: Vue2Instance;
  $parent: Vue2Instance;
  $props: Record<string, unknown>;
  $data: Record<string, unknown>;
  $options: {
    _componentTag?: string;
    __file?: string;
  };
  $route?: Route;
  _computedWatchers?: Record<string, { value: unknown }>;
};

type Vue3Instance = {
  vnode: {
    el: HTMLElement;
    props: Record<string, unknown>;
  };
  parent: Vue3Instance;
  type: {
    name?: string;
    __file?: string;
  };
  props: Record<string, unknown>;
  data: Record<string, unknown>;
  setupState: Record<string, unknown>;
  appContext: {
    config: {
      globalProperties: {
        $route?: Route;
      };
    };
  };
};

type VueInstance = Vue2Instance | Vue3Instance;

export type ElementNode = {
  type: 'element';
  el?: HTMLElement;
  title: string;
  location: string;
};

export type ComponentNode = {
  type: 'component';
  vm: VueInstance;
  el?: HTMLElement;
  title: string;
  location: string;
  isRoot: boolean;
  isRoute: boolean;
};

export type VueNode = ElementNode | ComponentNode;

function getVueInstance(el: HTMLElement | VueHtmlElement) {
  if ('__vue__' in el) return el.__vue__;
  if ('__vueParentComponent' in el && el.__vueParentComponent.vnode?.el === el)
    return el.__vueParentComponent;
  return undefined;
}

function findVueInstance(el?: HTMLElement | VueHtmlElement | null) {
  while (el) {
    if ('__vue__' in el) return el.__vue__;
    if ('__vueParentComponent' in el) return el.__vueParentComponent;
    el = el.parentElement;
  }
}

function getVueInstanceChain(vm: VueInstance | undefined) {
  const chain: VueInstance[] = [];

  while (vm) {
    chain.push(vm);

    if ('$parent' in vm) {
      vm = vm.$parent;
    } else if (vm.parent) {
      vm = vm.parent;
    } else {
      break;
    }
  }

  return chain;
}

function getComponentEl(vm: VueInstance) {
  if ('$el' in vm) return vm.$el;
  if ('vnode' in vm) return vm.vnode.el;
  return undefined;
}

function getComponentTitle(vm: VueInstance) {
  if ('$options' in vm) return vm.$options._componentTag || '';
  if (vm.type) return (vm.type.name || '').replace(options.cwd, '');
  return '';
}

function getComponentPath(vm: VueInstance) {
  if ('$options' in vm) return vm.$options.__file || '';
  if (vm.type) return (vm.type.__file || '').replace(options.cwd, '');
  return '';
}

function getComponentLocation(vm: VueInstance): string {
  let location = '';

  if ('$el' in vm && vm.$el) location = (vm.$el[`__${options.dataKey}`] as string) || '';
  else if ('vnode' in vm && vm.vnode?.props) location = (vm.vnode.props[`__${options.dataKey}`] as string) || '';

  if (location) return location.replace(options.cwd, '');

  return '';
}

function getElLocation(el: Record<string, any>) {
  return (el.__vnode?.props?.[`__${options.dataKey}`] || el[`__${options.dataKey}`] || '').replace(
    options.cwd,
    '',
  );
}

function getElTitle(el: HTMLElement) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const classes = el.className ? `.${el.className.replace(/\s+/g, '.')}` : '';
  return `${tag}${id}${classes}`;
}

function isRootInstance(vm: VueInstance) {
  if ('$parent' in vm) {
    return vm.$parent === vm.$root;
  } else {
    return !vm.parent;
  }
}

function getMatchRoute(vm: VueInstance) {
  let route: Route | undefined;

  if ('$route' in vm) {
    route = vm.$route;
  }
  if ('appContext' in vm) {
    route = vm.appContext.config.globalProperties.$route;
  }

  const path = getComponentPath(vm);

  return route?.matched.find((r) => {
    return Object.values(r.components).some((c) => {
      return c.__file.replace(options.cwd, '') === path;
    });
  });
}

export function getVueNodeStack(target: HTMLElement) {
  const stack: VueNode[] = [];

  const vm = findVueInstance(target);
  const vms = getVueInstanceChain(vm);
  if (!vms.length) return stack;

  if (!getVueInstance(target)) {
    const location = getElLocation(target);

    if (location) {
      const title = getElTitle(target);
      stack.push({ type: 'element', el: target, title, location });
    }
  }

  vms.forEach((vm) => {
    const el = getComponentEl(vm);

    const location = stack.length === 0 ? getComponentLocation(vm) : getComponentPath(vm);
    const title = getComponentTitle(vm) || getComponentPath(vm).split('/').pop() || 'unknown';

    if (!location) return;
    if (title === 'RouterView' && el === stack.at(-1)?.el) return;

    const route = getMatchRoute(vm);
    const isRoot = isRootInstance(vm);

    stack.push({ type: 'component', vm, el, title, isRoot, isRoute: !!route, location });
  });

  return stack;
}

export function matchModifierKey(e: MouseEvent) {
  const conditions = options.modifierKey.split('|');

  return conditions.some((condition) => {
    return condition
      .toLowerCase()
      .split('+')
      .filter((name) => SUPPORTED_MODIFIER_KEYS.includes(name))
      .every((name) => (e as unknown as Record<string, boolean>)[name + 'Key']);
  });
}

export function launchEditor(location: string) {
  const link = document.createElement('a');
  link.href = `vscode://file${options.cwd}/${location}`;
  link.click();
}

type BasicStateNode = {
  key: string;
  deep: number;
  type: 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'null' | 'undefined';
  value: string;
};

type ComplexStateNode = {
  key: string;
  deep: number;
  type: 'object' | 'array';
  value: string;
  expended: boolean;
  raw: unknown[] | object;
  children?: StateNode[];
};

export type StateNode = BasicStateNode | ComplexStateNode;

export type StateRootNode = {
  title: string;
  expended: boolean;
  children: StateNode[];
};

function formateStateValue(
  value: unknown,
  deep: number,
): Omit<BasicStateNode, 'key'> | Omit<ComplexStateNode, 'key'> {
  if (value === null) {
    return { deep, value: 'null', type: 'null' };
  }

  if (value === undefined) {
    return { deep, value: 'undefined', type: 'undefined' };
  }

  const type = typeof value;

  if (type === 'boolean') {
    return { deep, value: value.toString(), type };
  }

  if (type === 'string') {
    let newValue = (value as string).slice(0, 100);
    if ((value as string).length > 100) newValue += '...';
    return { deep, value: `"${newValue}"`, type };
  }

  if (type === 'number' || type === 'bigint') {
    return { deep, value: value.toString(), type: 'number' };
  }

  if (type === 'symbol') {
    return { deep, value: 'Symbol', type };
  }

  if (type === 'function') {
    return { deep, value: 'Function', type };
  }

  if (Array.isArray(value)) {
    return {
      deep,
      value: `Array(${value.length})`,
      type: 'array',
      expended: false,
      raw: value,
    };
  }

  return {
    deep,
    value: 'Object',
    type: 'object',
    expended: false,
    raw: value,
  };
}

export function formatStateValues(values: unknown[] | object, deep = 1): StateNode[] {
  const entries = Array.isArray(values) ? [...values.entries()] : Object.entries(values || {});

  return entries.map(([key, value]) => {
    return { key: key.toString(), ...formateStateValue(value, deep) };
  });
}

export function getComponentPropTree(vm: VueInstance) {
  if ('$props' in vm) return formatStateValues(vm.$props);
  if ('props' in vm) return formatStateValues(vm.props);
  return [];
}

export function getComponentDataTree(vm: VueInstance) {
  if ('$data' in vm) return formatStateValues(vm.$data);
  if ('data' in vm) return formatStateValues(vm.data);
  return [];
}

export function getComponentSetupStateTree(vm: VueInstance) {
  // TODO:
  if ('setupState' in vm) return formatStateValues(vm.setupState);
  return [];
}

export function getComponentComputedTree(vm: VueInstance) {
  if ('_computedWatchers' in vm) {
    return formatStateValues(
      Object.entries(vm._computedWatchers || {}).reduce(
        (values, [key, { value }]) => ({ ...values, [key]: value }),
        {},
      ),
    );
  }

  return [];
}
