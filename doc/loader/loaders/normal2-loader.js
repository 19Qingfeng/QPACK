function loader(source) {
  console.log('normal2');
  return source + '//normal2';
}
loader.pitch = function (remainingRequest, previousRequest, data) {
  console.log('normal2-loader pitch');
};

module.exports = loader;
