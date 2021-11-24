// function loader(source) {
//   console.log(this.data, 'data');
//   console.log('this is loader Context post');
//   // 将这个loader变成异步 可以在这里调用接口读取文件之类的进行异步操作
//   const callback = this.async();
//   console.log('post2');
//   // 调用callback 表示loader执行完毕
//   callback();
// }

function loader(source) {
  console.log(this.data, 'data');
  console.log('this is loader Context post');
  // 将这个loader变成异步 可以在这里调用接口读取文件之类的进行异步操作
  // const callback = this.async();
  console.log('post2');
  // 调用callback 表示loader执行完毕
  // callback();
  return source;
}

// loader.pitch = function (remainingRequest, precedingRequest, data) {
//   // 每一个loader都会被处理成为一个独立的对象
//   data.name = { name: 'wanghaoyu' };
// };

module.exports = loader;
