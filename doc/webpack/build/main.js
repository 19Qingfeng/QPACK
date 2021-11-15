(() => {
  var __webpack_modules__ = {
    './doc/webpack/dep.js': (module) => {
      const name = '19Qingfeng';
      module.exports = name;
      const loader2 = '19Qingfeng';
      const loader1 = 'https://github.com/19Qingfeng';
    },
    './doc/webpack/second.js': (module) => {
      const name = __webpack_require__('./doc/webpack/dep.js');

      console.log(name, 'second 引入的title');
      console.log('second');
      const loader2 = '19Qingfeng';
      const loader1 = 'https://github.com/19Qingfeng';
    },
  };
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = (__webpack_module_cache__[moduleId] = {
      // no module.id needed
      // no module.loaded needed
      exports: {},
    });

    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // Return the exports of the module
    return module.exports;
  }

  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  (() => {
    const name = __webpack_require__('./doc/webpack/dep.js');

    const second = __webpack_require__('./doc/webpack/second.js'); // const index1 = require('./src/index1');

    console.log(index1, '循环依赖');
    console.log(name, '引入的name');
    console.log('This is is main entry.');
    const loader2 = '19Qingfeng';
    const loader1 = 'https://github.com/19Qingfeng';
  })();
})();
