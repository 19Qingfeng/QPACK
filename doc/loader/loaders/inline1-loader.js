function loader(source) {
  console.log('inline1');
  return source + '//inline1';
}

loader.pitch = function () {
  const callback = this.async();
  console.log('异步loader开始');
  setTimeout(() => {
    console.log('异步pitch loader结束');
    callback();
  }, 3000);
  console.log('inline1 pitch');
  // return 'pitch return on inline1';
};

// raw为true表示 loader在处理资源时 normal函数接受的参数为二进制buffer而非string
// false或者不配置 默认为string
loader.raw = true;

module.exports = loader;
