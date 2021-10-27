const babelTypes = require('@babel/types');

function ArrowFunctionExpression(path) {
  const node = path.node;
  hoistFunctionEnvironment(path);
  node.type = 'FunctionDeclaration';
}

/**
 *
 *
 * @param {*} nodePath 当前节点路径
 */
function hoistFunctionEnvironment(nodePath) {
  // 往上查找 直到找到最近顶部非箭头函数的this p.isFunction() && !p.isArrowFunctionExpression()
  // 或者找到跟节点 p.isProgram()
  const thisEnvFn = nodePath.findParent((p) => {
    return (p.isFunction() && !p.isArrowFunctionExpression()) || p.isProgram();
  });
  // 接下来查找当前作用域中那些地方用到了this的节点路径
  const thisPaths = getScopeInfoInformation(thisEnvFn);
  const thisBindingsName = generateBindName(thisEnvFn);
  // thisEnvFn中添加一个变量 变量名为 thisBindingsName 变量值为 this
  // 相当于 const _this = this
  thisEnvFn.scope.push({
    id: babelTypes.Identifier(thisBindingsName),
    init: babelTypes.thisExpression(),
  });
  // TODO: 不太理解 为什么作用域内部 path所有节点都会替换(traverse会拿到所有嵌套节点)
  // TODO: 有BUG
  /* 
    const a = () => {
      console.log(this, 'this');
      function b() {
        console.log(this, 'this');
      }
    };
    这段代码转译后b函数中的this也变化了
  */
  thisPaths.forEach((thisPath) => {
    // 将this替换称为_this
    const replaceNode = babelTypes.Identifier(thisBindingsName);
    thisPath.replaceWith(replaceNode);
  });
}

/**
 *
 * 查找当前作用域内this使用的地方
 * @param {*} nodePath 节点路径
 */
function getScopeInfoInformation(nodePath) {
  const thisPaths = [];
  nodePath.traverse({
    // 深度遍历节点路径 找到内部this语句
    ThisExpression(thisPath) {
      thisPaths.push(thisPath);
    },
  });
  return thisPaths;
}

/**
 * 判断之前是否存在 _this 这里简单处理下
 * 直接返回固定的值
 * @param {*} path 节点路径
 * @returns
 */
function generateBindName(path, name = '_this', n = '') {
  if (path.scope.hasBinding(name)) {
    generateBindName(path, '_this' + n, parseInt(n) + 1);
  }
  return name;
}

module.exports = {
  hoistFunctionEnvironment,
  arrowFunctionPlugin: {
    visitor: {
      ArrowFunctionExpression,
    },
  },
};
