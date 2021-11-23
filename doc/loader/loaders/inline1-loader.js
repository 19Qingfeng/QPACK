function loader(source) {
  console.log('inline1');
  return source + '//inline1';
}

// 将资源不转化成字符串 调用buffer读取资源
loader.raw = true;

module.exports = loader;
