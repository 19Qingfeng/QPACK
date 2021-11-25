function loader(source) {
  console.log('post1', source);
  return source + '//post1';
}

loader.pitch = function (remainingRequest, previousRequest, data) {
  console.log('post1-loader pitch');
};

module.exports = loader;
