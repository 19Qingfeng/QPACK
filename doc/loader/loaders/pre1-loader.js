function loader(source) {
  console.log('pre1');
  return source + '//pre1';
}

loader.pitch = function (remainingRequest, previousRequest, data) {
  console.log('pre1-loader pitch');
};
module.exports = loader;
