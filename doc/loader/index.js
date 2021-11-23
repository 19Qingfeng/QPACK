const path = require('path');
const fs = require('fs');

// 入口模块
const filePath = path.resolve(__dirname, '../../src/index.js');

// 模拟引入
const request = 'inline1-loader!inline2-loader!./title.js';

// 模拟webpack配置
const rules = [
  // 普通loader
  {
    test: /\.js$/,
    use: ['normal1-loader', 'normal2-loader'],
  },
  // 前置loader
  {
    test: /\.js$/,
    use: ['pre1-loader', 'pre2-loader'],
    enforce: 'pre',
  },
  // 后置loader
  {
    test: /\.js$/,
    use: ['post1-loader', 'post2-loader'],
    enforce: 'post',
  },
];

// loader顺序
// pitch post -> inline -> normal -> pre
// normal pre -> normal -> inline -> post

// 提取inline loader
const parts = request.split('!');
// 文件路径
const sourcePath = parts.pop();

// 解析loader的绝对路径
const resolveLoader = (loader) => path.resolve(__dirname, './loaders', loader);

// 所有的行内loader的绝对路径
const inlineLoaders = parts.map(resolveLoader);

// 处理rules中的loader
const preLoaders = [],
  normalLoaders = [],
  postLoaders = [];

rules.forEach((rule) => {
  // 如果匹配情况下
  if (rule.test.test(sourcePath)) {
    switch (rule.enforce) {
      case 'pre':
        preLoaders.push(...rule.use);
        break;
      case 'post':
        postLoaders.push(...rule.use);
        break;
      default:
        normalLoaders.push(...rule.use);
        break;
    }
  }
});

const loaders = [
  ...preLoaders,
  ...normalLoaders,
  ...inlineLoaders,
  ...postLoaders,
];
console.log(loaders, '25min');
