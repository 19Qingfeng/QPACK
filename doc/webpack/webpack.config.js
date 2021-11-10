const { resolve } = require('path');

// 插件A
class PluginA {
  apply() {
    console.log('PluginA');
  }
}

// 插件B
class PluginB {
  apply() {
    console.log('PluginB');
  }
}

module.exports = {
  entry: './main.js',
  output: resolve(__dirname, './dist'),
  plugins: [new PluginA(), new PluginB()],
};
