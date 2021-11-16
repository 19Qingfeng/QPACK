/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./doc/webpack/dep.js":
/*!****************************!*\
  !*** ./doc/webpack/dep.js ***!
  \****************************/
/***/ ((module) => {

const name = '19Qingfeng';

module.exports = name;

 const loader2 = '19Qingfeng'
 const loader1 = 'https://github.com/19Qingfeng'

/***/ }),

/***/ "./doc/webpack/second.js":
/*!*******************************!*\
  !*** ./doc/webpack/second.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const name = __webpack_require__(/*! ./dep */ "./doc/webpack/dep.js");
console.log(name, 'second 引入的title');

console.log('second');

 const loader2 = '19Qingfeng'
 const loader1 = 'https://github.com/19Qingfeng'

/***/ }),

/***/ "./doc/webpack/src/index1.js":
/*!***********************************!*\
  !*** ./doc/webpack/src/index1.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const index2 = __webpack_require__(/*! ./index2 */ "./doc/webpack/src/index2.js");
console.log('index2');
const index1 = '1';

module.exports = {
  index1,
};

 const loader2 = '19Qingfeng'
 const loader1 = 'https://github.com/19Qingfeng'

/***/ }),

/***/ "./doc/webpack/src/index2.js":
/*!***********************************!*\
  !*** ./doc/webpack/src/index2.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const index1 = __webpack_require__(/*! ./index1 */ "./doc/webpack/src/index1.js");
console.log(index1, 'index1');

const index2 = '2';

module.exports = {
  index2,
};

 const loader2 = '19Qingfeng'
 const loader1 = 'https://github.com/19Qingfeng'

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./doc/webpack/main.js ***!
  \*****************************/
const name = __webpack_require__(/*! ./dep */ "./doc/webpack/dep.js");
const second = __webpack_require__(/*! ./second */ "./doc/webpack/second.js");
const index1 = __webpack_require__(/*! ./src/index1 */ "./doc/webpack/src/index1.js");
console.log(index1, '循环依赖');
console.log(name, '引入的name');
console.log('This is is main entry.');

 const loader2 = '19Qingfeng'
 const loader1 = 'https://github.com/19Qingfeng'
})();

/******/ })()
;