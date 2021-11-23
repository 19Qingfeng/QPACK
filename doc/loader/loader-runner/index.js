const fs = require('fs');
/*
  优先pitch -> normal
  loader的熔断效果:如果在loader的pitch阶段中进行了返回非undefined，那么此时将会把pitch的返回值作为参数传递给下一个normal进行熔断效果（接下来的loader都不会被执行无论是pitch和normal阶段）。这里需要画图去解释。
*/

function runLoaders(options, callback) {
  // 资源路径
  const resource = options.resource || '';
  // 需要进行处理的loaders绝对路径
  const loaders = options.loaders || [];
  // loader 执行上下文 每个loader中的this就会指向loader-context
  const loaderContext = options.context || {};
  // 读取文件的方法 这里和源码有出入
  const readResource = options.processResource || fs.readFile.bind(fs);

  // 创建loader对象
}

/**
 *
 * 通过loader的绝对路径地址创建loader对象
 * @param {*} loader loader的绝对路径地址
 */
function createLoaderObject(loader) {
  const obj = {
    normal: null, // loader函数本身
    pitch: null, // loader的pitch函数
    // 在执行loader之前 webpack会讲一些资源文件转化称为字符串传递给loader
    // 如果不需要进行字符串转化 将raw制为true 将会传递buffer。比如加载图片时
    raw: null, // 是否需要将loader转化称为字符串 默认是字符串
    data: null, // 每个loader的自定义数据对象，用来存放自定义信息
    pitchExecuted: false, // loader的pitch是否已经执行过
    normalExecuted: false, // 这个loader本身是否已经执行过
    request: loader, // 当前loader资源绝对路径
  };
  // 加载loader模块
  const normalLoader = require(obj.request);
  obj.normal = normalLoader;
  // 赋值pitch
  obj.pitch = normalLoader.pitch;
  // 是否需要转化成字符串
}

module.exports = {
  runLoaders,
};
