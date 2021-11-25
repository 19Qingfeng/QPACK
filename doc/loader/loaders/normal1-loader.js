function loader(source) {
  console.log(this.data.name, 'normal1 data');
  return source + '//normal1';
}

loader.pitch = function (remainingRequest, previousRequest, data) {
  data.name = 'wanghaoyu';
  console.log('normal1 pitch set named wanghaoyu');
  console.log('normal1-loader pitch');
};

module.exports = loader;
