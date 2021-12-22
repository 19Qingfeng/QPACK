function loader(source) {
  console.log('source inline1:', source);
  return source + '//inline1';
}

loader.pitch = function () {
  console.log(this, 'this 对象');
  // console.log(this.getOptions(), 'options');
  // console.log(this.getOptions(), 'options');
  // console.log(this.getOptions(), 'options');
  // console.log(this.getOptions(), 'options');

  // console.log(this.getOptions(), 'options');
  const callback = this.async();
  console.log('异步loader开始');
  setTimeout(() => {
    console.log('异步pitch loader结束');
    callback(undefined);
  }, 3000);
  console.log('inline1 pitch');
  // return 'pitch return on inline1';
};

// raw为true表示 loader在处理资源时 normal函数接受的参数为二进制buffer而非string
// false或者不配置 默认为string
loader.raw = true;

module.exports = loader;
