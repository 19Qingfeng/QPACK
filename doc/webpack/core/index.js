const webpack = require('./webpack');
// 步骤1: 初始化参数 根据配置文件和shell参数合成参数
const config = require('../webpack.config.js');
// 步骤2: 调用Webpack(options) 初始化compiler对象
const compiler = webpack(config);
// 步骤3: 加载所有配置的插件 -> webpack.js中
// ... webpack.js
// 步骤4: 调用compiler.run方法执行编译工作
// 4.1 首先寻找入口文件 entry
compiler.run((err, stats) => {
  if (err) {
    console.log(err, 'err');
  }
  const outputOptions = stats.toJson();
  console.log(outputOptions, 'outputOptions');
});
