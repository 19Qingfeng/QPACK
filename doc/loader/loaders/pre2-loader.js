function loader(source) {
  console.log('pre2');
  return source + '//pre2';
}

loader.pitch = function (remainingRequest, previousRequest, data) {
  console.log('pre2-loader pitch');
};
module.exports = loader;
