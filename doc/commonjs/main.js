const modules = {
  './src/title.js': (module, exports, require) => {
    module.exports = 'wang.haoyu'
  },
};

const cache = {};

function require(moduleId) {
  if (cache[moduleId] !== undefined) {
    return cache[moduleId];
  }
  const module = (cache[moduleId] = {
    exports: {},
  });

  modules[moduleId](module, module.exports, require);
  return module.exports
}

const title = require('./src/title.js');
console.log(title, 'title');
