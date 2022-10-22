const VueInspectorPlugin = require('vue-inspector-plugin');

module.exports = {
  chainWebpack(config) {
    config.plugin('VueInspectorPlugin').use(new VueInspectorPlugin());
  },
};
