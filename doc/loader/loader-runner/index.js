const fs = require('fs');
/*
  优先pitch -> normal
  loader的熔断效果:如果在loader的pitch阶段中进行了返回非undefined，那么此时将会把pitch的返回值作为参数传递给下一个normal进行熔断效果（接下来的loader都不会被执行无论是pitch和normal阶段）。这里需要画图去解释。
*/

function runLoaders(options, callback) {
  // 资源路径
  const resource = options.resource || '';
  // 需要进行处理的loaders绝对路径
  let loaders = options.loaders || [];
  // loader 执行上下文 每个loader中的this就会指向loader-context
  const loaderContext = options.context || {};
  // 读取文件的方法 这里和源码有出入
  const readResource = options.processResource || fs.readFile.bind(fs);
  // 根据loader路径创建loader对象
  loaders = loaders.map(createLoaderObject);
  // loaderContext loader函数内部的this对象
  loaderContext.resourcePath = resource; // 资源路径
  loaderContext.readResource = readResource; // 读取资源方法
  loaderContext.loaderIndex = 0; // 当前正在执行loader的索引
  loaderContext.loaders = loaders; // 所有的loader对象
  loaderContext.data = null; // pitch中通过data传递给normal值
  // 异步loader属性
  loaderContext.async = null;
  loaderContext.callback = null;
  // request 保存所有loader路径和资源路径- 转化为inline-loader的形式
  Object.defineProperty(loaderContext, 'request', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .map((l) => l.request)
        .concat(loaderContext.resourcePath || '')
        .join('!');
    },
  });
  // 剩下的请求 不包含自身 包含资源路径
  Object.defineProperty(loaderContext, 'remainingRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((i) => i.request)
        .concat(loaderContext.resource)
        .join('!');
    },
  });
  // 包含自身剩余的请求 同时包含资源路径
  Object.defineProperty(loaderContext, 'currentRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((i) => i.request)
        .concat(loaderContext.resource)
        .join('!');
    },
  });
  // 之前的请求 不需要链接资源路径
  Object.defineProperty(loaderContext, 'previousRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((i) => i.request)
        .join('!');
    },
  });
  // 保存patch存储的值 pitch方法中的第三个参数可以修改 通过normal中的this.data可以获得对应loader的pitch方法操作的data
  // 通过代理: 获取当前loader的data
  Object.defineProperty(loaderContext, 'data', {
    get: function () {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });
  const processOptions = {
    // 存储读取资源文件的二进制内容 (转化前 原始文件内容)
    resourceBuffer: null,
  };
  // 迭代pitch-loader处理
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}

/**
 *
 * 读取文件方法
 * @param {*} options
 * @param {*} loaderContext
 * @param {*} callback
 */
function processResource(options, loaderContext, callback) {
  // 重制越界的 loaderContext.loaderIndex
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;
  const resource = loaderContext.resourcePath;
  // 相当于fs方法读取文件
  loaderContext.readResource(resource, (err, buffer) => {
    if (err) {
      return callback(err);
    }
    // 保存原始文件内容的buffer
    options.resourceBuffer = buffer;
    console.log(
      options.resourceBuffer.toString(),
      'pitch执行完毕 这里是buffer'
    );
  });
}

/**
 * 迭代pitch-loaders
 * 核心思路: 执行第一个loader的pitch 依次迭代 如果到了最后一个结束 就开始读取文件
 * @param {*} options processOptions对象
 * @param {*} loaderContext loader中的this对象
 * @param {*} callback runLoaders中的callback函数
 */
function iteratePitchingLoaders(options, loaderContext, callback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    // 表示所有pitch已经执行完毕了 应该读取文件内容了
    return processResource(options, loaderContext, callback);
  }

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  // 如果当前loader的pitch已经执行过了 那么就会迭代下一个
  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  const pitchFunction = currentLoaderObject.pitch;
  // 表示该loader的pitch已经执行过
  currentLoaderObject.pitchExecuted = true;

  // 该loader不存在pitch方法 递归调用下一个loader处理
  if (!pitchFunction) {
    return iteratePitchingLoaders(options, loaderContext, callback);
  }
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
  // 加载loader模块 真实源码中通过loadLoader加载还支持ESM模块 这里仅仅支持CJS语法
  const normalLoader = require(obj.request);
  obj.normal = normalLoader;
  // 赋值pitch
  obj.pitch = normalLoader.pitch;
  // 是否需要转化成字符串
  obj.raw = normalLoader.raw;
  return obj;
}

module.exports = {
  runLoaders,
};
