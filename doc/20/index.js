/* 
  ES6模块导出
*/

const modules = {
  './src/title.js': (module, exports, require) => {
    // 调用这个模块的时候 给予这个模块特殊的标示(标示它是ES6模块方式)
    require.r(exports);
    // 定义模块导出属性
    require.d(exports, {
      default: () => DEFAULT_EXPORT,
      age: () => age,
    });
    const age = 'age';
    const DEFAULT_EXPORT = title;
  },
};

// 缓存模块
const cache = {};

// 实现require方法
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

// 标记模块方法
require.r = (exports) => {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'module' });
  }
  Object.defineProperty(exports, '_esModule', { value: true });
};

// 入口文件内容
const title = require('./src/title.js');
console.log(title.default);
console.log(title.age);
