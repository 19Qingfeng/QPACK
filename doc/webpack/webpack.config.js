const path = require('path');
const EmitPlugins = require('./plugins/emit-plugin');

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
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './main.js'),
    second: path.resolve(__dirname, './second.js'),
  },
  devtool: false,
  // 基础目录，绝对路径，用于从配置中解析入口点(entry point)和 加载器(loader)。
  // 换而言之entry和loader的所有相对路径都是相对于这个路径而言的
  context: process.cwd(),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  plugins: [new PluginA(), new PluginB(), new EmitPlugins()],
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: [
          // 使用自己loader有三种方式 这里仅仅是一种
          path.resolve(__dirname, './loaders/loader1.js'),
          path.resolve(__dirname, './loaders/loader2.js'),
        ],
      },
    ],
  },
};
