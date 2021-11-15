const path = require('path');
const { resolve } = require('path');

// 插件A
class PluginA {
  apply(compiler) {
    // 注册同步钩子
    compiler.hooks.run.tap('Plugin A', () => {
      // 调用
      console.log('PluginA');
    });
  }
}

// 插件B
class PluginB {
  apply(compiler) {
    compiler.hooks.done.tap('Plugin B', () => {
      console.log('PluginB');
    });
  }
}

module.exports = {
  entry: {
    main: './main.js',
    second: path.resolve(__dirname, './main.js'),
  },
  // 基础目录，绝对路径，用于从配置中解析入口点(entry point)和 加载器(loader)。
  // 换而言之entry和loader的所有相对路径都是相对于这个路径而言的
  context: process.cwd(),
  output: resolve(__dirname, './dist'),
  plugins: [new PluginA(), new PluginB()],
};
