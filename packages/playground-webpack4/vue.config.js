const vueInspectorPlugin = require('vue-inspector-plugin/webpack').default;

module.exports = {
  chainWebpack(config) {
    config.plugin('VueInspectorPlugin').use(vueInspectorPlugin());
  },
};
