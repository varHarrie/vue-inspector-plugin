const path = require('path');
const webpack = require('webpack');

const uiEntry = path.resolve(__dirname, 'ui.js');
const cwd = process.cwd().replace(/\\/g, '/');

class VueInspectorPlugin {
  constructor({ rootDir, modifierKey } = {}) {
    this.rootDir = rootDir || cwd;
    this.modifierKey = modifierKey || 'ctrl|meta';
  }

  apply(compiler) {
    const variables = {
      'process.env.__VUE_INSPECTOR_ROOT__': `"${this.rootDir}"`,
      'process.env.__VUE_INSPECTOR_MODIFIER_KEY__': `"${this.modifierKey}"`,
    };

    new webpack.DefinePlugin(variables).apply(compiler);

    if (webpack.version.startsWith('5.')) {
      compiler.options.entry['__vue_inspector__'] = { import: [uiEntry] };
    } else {
      compiler.options.entry['__vue_inspector__'] = [uiEntry];
    }
  }
}

module.exports = VueInspectorPlugin;
