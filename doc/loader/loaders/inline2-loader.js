function loader(source) {
  console.log('inline2');
  return source + '//inline2';
}

loader.pitch = function () {
  console.log('inline2 pitch');
  console.log('3s前', Date.now());
  // loader中可以直接返回Promise 作为异步loader处理
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('3s后 inline2 异步结束', Date.now());
      resolve();
    }, 3000);
  });
};

// loader.pitch = function () {
//   console.log('pitch');
// };

module.exports = loader;
