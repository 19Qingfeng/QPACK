// TODO 重新梳理下异步加载模块流程 目前有点乱

/* 
  源码中还有很多的细节还没处理。。。还是没有彻底理解
*/

const modules = {};
const caches = {};

function require(moduleId) {
  const cacheModule = cache[moduleId];
  if (cacheModule !== undefined) {
    return cacheModule;
  }
  const module = (cache[moduleId] = {
    exports: {},
  });
  modules[moduleId](module, module.exports, require);
  return module.exports;
}

// 目前已经加载的模块 0表示已经加载
const installedChunks = {
  main: 0,
};

// output.publicPath
require.publicPath = '';

// 通过chunkId解析名称
require.u = (chunkId) => chunkId + '.js';

require.m = modules; // require上m属性挂模块

require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

// 定义模块导出属性
require.d = (exports, definition) => {
  for (let key in definition) {
    if (!require.o(exports, key) && require.o(definition, key)) {
      Object.defineProperty(exports, key, {
        get: definition[key],
      });
    }
  }
};

// 存放函数
require.f = {};

require.f.j = (chunkId, promises) => {
  // 判断当前模块是否已经加载
  const installedChunkData = require.o(installedChunks, chunkId)
    ? installedChunks[chunkId]
    : undefined;
  if (installedChunkData !== 0) {
    if (installedChunkData) {
      // 当前未成功 但是有值 直接拿出上一个相同模块加载的Promise放到数组中
      // installedChunkData[2]就是上一次加载这个模块的Promise
      promises.push(installedChunkData[2]);
    } else {
      // 未加载过
      const promise = new Promise((resolve, reject) => {
        installedChunkData = installedChunkData[chunkId] = [resolve, reject];
      });
      installedChunkData.push(promise);
      // 接下来应该创建script标签 加载脚本进行执行
      // url = publicPath + fileurl
      const url = require.publicPath + require.u(chunkId);
      // 加载资源方法
      require.load(url);
    }
  }
};

// jsonp load script
require.load = (url) => {
  const script = document.createElement('script');
  script.url = url;
  document.head.appendChild(script);
};

// 异步加载chunks 通过异步jsonp加载js脚本
// 传入 src_title_js
require.e = (chunkId) => {
  const promises = [];
  Object.keys(require.r).forEach((func) => func(chunkId, promises));
  return Promise.all(promises);
};

/* 
  加载成功的异步脚本会在 self[webpackChunk_bundle]中push一个数组
  数组中存放相关本次加载模块的详细内容
*/
function webpackJsonCallBack(data) {
  // chunkIds 是异步加载chunk name的数组
  // moreModule 是异步加载chunk对应的{ 路径：内容 }
  const [chunkIds, moreModule] = data;
  // 合并modules
  for (let moduleId in moreModule) {
    // 将加载完成的脚本合并进入全局modules中去
    require.m[moduleId] = moreModule[moduleId];
  }
  // 标记installedChunks
  for (let i = 0; i < chunkIds.length - 1; i++) {
    // 调用模块加载Promise的resolve
    installedChunks[chunkIds[i]][0]();
    // 状态变更为成功
    installedChunks[chunkIds[i]] = 0;
  }
}

// 定义全局异步加载脚本
const chunkLoadingGlobal = (window['webpackChunk_bundle'] = []);
// 重写push方法
chunkLoadingGlobal.push = webpackJsonCallBack;

// 入口文件源码
document.addEventListener('click', () => {
  require
    .e('src_title_js')
    // 等待script脚本成功之后 正常加载./src/title.js
    .then(require.bind(require, './src/title.js'))
    .then((result) => console.log(result.default));
});
/* 
document.addEventListener('click',() => {
  import('./src/title.js').then((title) => {
    console.log(title)
  })
})
*/

// 异步加载Chunks(title.js) webpack编译后的代码
window['webpackChunk_bundle'].push([
  ['src_title_js'],
  {
    './src/title.js': (module, exports, require) => {
      require.r(exports);
      require.d(exports, {
        default: () => '19Qingfeng',
        name: () => 'wang.haoyu',
      });
    },
  },
]);
