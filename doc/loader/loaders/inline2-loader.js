function loader(source) {
  console.log('inline2');
  return source + '//inline2';
}

// loader.pitch = function () {
//   console.log('pitch');
// };

module.exports = loader;
