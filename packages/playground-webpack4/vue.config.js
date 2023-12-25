const vueInspectorPlugin = require('../../dist/webpack.cjs').default;

module.exports = {
  chainWebpack(config) {
    config.plugin('VueInspectorPlugin').use(vueInspectorPlugin());
  },
};
