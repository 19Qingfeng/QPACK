/* es 加载 commonjs */
const modules = {
  './src/index.js': (module, exports, require) => {
    // commonjs导出
    module.exports = {
      name: 'wang.haoyu',
      github: '19Qingfeng',
    };
    // esm导出
    // 标记ESM模块
    // require.n(exports);
    // require.d(exports, {
    //   default: () => ({
    //     name: 'wang.haoyu',
    //     nickName: 'wang.haoyu',
    //   }),
    //   github: () =>  '19Qingfeng',
    // });
  },
};

const caches = {};
function require(moduleId) {
  const cacheModule = caches[moduleId];
  if (cacheModule) {
    return cacheModule.exports;
  }
  const module = (caches[moduleId] = {
    exports: {},
  });
  modules[moduleId](module, module.exports, require);
  return module.exports;
}

require.r = (exports) => {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag !== undefined) {
    Object.defineProperty(exports, Symbol.toStringTag, {
      value: 'module',
      enumerable: true,
    });
  }
  Object.defineProperty(exports, '__esModule', { value: 'true' });
};

require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

require.d = (exports, definition) => {
  for (let key in definition) {
    if (!require.o(exports, key) && require.o(definition, key)) {
      Object.defineProperty(exports, key, {
        get: definition[key],
      });
    }
  }
};

require.n = (module) => {
  return module && module.__esModule ? () => module.default : () => module;
};

// 入口文件
var exports = {}; // 入口文件导出内容
// 标记入口文件导出为ESM
require.r(exports);
const title = require('./src/index.js');
// 判断是ESM还是COMMONJS进行默认加载
const defaultExport = require.n(title);
console.log(defaultExport());
console.log(title.github);
