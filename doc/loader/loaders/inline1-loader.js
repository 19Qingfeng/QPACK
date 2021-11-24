function loader(source) {
  console.log(this.data, 'inline1');
  console.log('inline1');
  return source + '//inline1';
}

// loader.pitch = function () {
//   console.log('pitch');
// };

// raw为true表示 loader在处理资源时 normal函数接受的参数为二进制buffer而非string
// false或者不配置 默认为string
loader.raw = true;

module.exports = loader;
