/**
 *
 * 统一路径分隔符
 * @param {*} path
 * @returns
 */
function toUnixPath(path) {
  return path.replace(/\\/g, '/');
}

module.exports = {
  toUnixPath,
};
