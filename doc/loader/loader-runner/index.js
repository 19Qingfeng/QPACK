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
  loaderContext.callback = null; // callback 同时支持多个参数传递，而同步仅仅支持一个参数
  // request 保存所有loader路径和资源路径- 转化为inline-loader的形式
  Object.e(loaderContext, 'request', {
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
  // 迭代pitch-loader处理 pitching中会调用normal
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
    iterateNormalLoaders(options, loaderContext, [buffer], callback);
  });
}

/**
 * 迭代normal-loaders 根据loaderIndex的值进行迭代
 * 核心思路: 迭代完成pitch-loader之后 读取文件 迭代执行normal-loader
 *          或者在pitch-loader中存在返回值 熔断执行normal-loader
 * @param {*} options processOptions对象
 * @param {*} loaderContext loader中的this对象
 * @param {*} args [buffer/any]
 * 当pitch阶段不存在返回值时 此时为即将处理的资源文件
 * 当pitch阶段存在返回值时 此时为pitch阶段的返回值
 * @param {*} callback runLoaders中的callback函数
 */
function iterateNormalLoaders(options, loaderContext, args, callback) {
  // 如果已经超出loader下标
  if (loaderContext.loaderIndex < 0) {
    return callback(null, args);
  }
  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  const normalFunction = currentLoader.normal;
  // 标记为执行过
  currentLoader.normalExecuted = true;
  // 检查是否执行过
  if (!normalFunction) {
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }
  // 根据loader中raw的值 格式化source
  convertArgs(args, currentLoader.raw);
  // 执行loader
  runSyncOrAsync(normalFunction, loaderContext, args, (err, ...args) => {
    if (err) {
      return callback(err);
    }
    // 继续迭代 注意这里的args是处理过后的args
    iterateNormalLoaders(options, loaderContext, args, callback);
  });
}

/**
 *
 * 转化资源source的格式
 * @param {*} args [资源]
 * @param {*} raw Boolean 是否需要Buffer
 * raw为true 表示需要一个Buffer
 * raw为false表示不需要Buffer
 */
function convertArgs(args, raw) {
  if (!raw && Buffer.isBuffer(args[0])) {
    // 我不需要buffer
    args[0] = args[0].toString();
  } else if (raw && typeof args[0] === 'string') {
    // 需要Buffer 资源文件是string类型 转化称为Buffer
    args[0] = Buffer.from(args[0], 'utf8');
  }
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

  // 执行loader 针对时同步还是异步的方式进行运行
  runSyncOrAsync(
    pitchFunction,
    loaderContext,
    [
      currentLoaderObject.remainingRequest,
      currentLoaderObject.previousRequest,
      currentLoaderObject.data,
    ],
    function (err, ...args) {
      if (err) {
        // 存在错误直接调用callback
        return callback(err);
      }
      // 根据返回值 判断是否需要熔断 or 继续往下执行下一个pitch
      // pitch函数存在返回值 -> 进行熔断 掉头执行normal-loader
      // pitch函数不存在返回值 -> 继续迭代下一个 iteratePitchLoader
      const hasArg = args.some((i) => i !== undefined);
      if (hasArg) {
        loaderContext.loaderIndex--;
        // 熔断 直接返回调用normal-loader
        iterateNormalLoaders(options, loaderContext, args, callback);
      } else {
        // 这个pitch-loader执行完毕后 继续调用下一个loader
        iteratePitchingLoaders(options, loaderContext, callback);
      }
    }
  );
}

/**
 *
 * 执行loader 同步/异步
 * @param {*} fn 需要被执行的函数
 * @param {*} context loader的上下文对象
 * @param {*} args [remainingRequest,previousRequest,currentLoaderObj.data = {}]
 * @param {*} callback 外部传入的callback (runLoaders方法的形参)
 */
function runSyncOrAsync(fn, context, args, callback) {
  // 是否同步 默认同步loader 表示当前loader执行完自动依次迭代执行
  let isSync = true;
  // 表示传入的fn是否已经执行过了 用来标记重复执行
  let isDone = false;

  // 定义 this.callback
  // this.async 通过闭包访问调用innerCallback 表示异步loader执行完毕
  const innerCallback = (context.callback = function () {
    if (isDone) {
      // loader已经执行过了
      new Error('current Loader already called!');
    }
    isDone = true;
    // 这里该不该sync无所谓了其实 源码中有就加入吧
    isSync = false;
    callback(null, ...arguments);
  });

  // 定义异步 this.async
  // 每次loader调用都会执行runSyncOrAsync都会重新定义一个context.async方法
  context.async = function () {
    isSync = false; // 将本次同步变更成为异步
    return innerCallback;
  };

  // 调用pitch-loader执行 将this传递成为loaderContext 同时传递三个参数
  // 返回pitch函数的返回值 甄别是否进行熔断
  const result = fn.apply(context, args);

  if (isSync) {
    isDone = true;
    if (result === undefined) {
      return callback();
    }
    // 如果 loader返回的是一个Promise 异步loader
    if (
      result &&
      typeof result === 'object' &&
      typeof result.then === 'function'
    ) {
      // 同样等待Promise结束后直接熔断 否则Reject 直接callback错误
      return result.then((r) => callback(null, r), callback);
    }
    // 非Promise 切存在执行结果 进行熔断
    return callback(null, result);
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
    data: {}, // 每个loader的自定义数据对象，用来存放自定义信息
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
