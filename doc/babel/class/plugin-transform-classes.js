const babelTypes = require('@babel/types');

function transformClassPlugin({ name }) {
  console.log(name, '接受的参数');
  return {
    visitor: {
      ClassDeclaration(nodePath) {
        // 定义替换的节点
        const fns = [];
        const { node } = nodePath;
        // nodeId上存在当前类的名称 id: { type:'Identifier',name:'Person' }
        const { id, parent } = node;
        const method = node.body.body;
        // 获得对应类上的方法
        method.forEach((classMethod) => {
          // 取到对应的constructor函数体 生成新普通函数 命名为node.name
          if (classMethod.kind === 'constructor') {
            // 生成对应的构造函数
            // 往同级别类节点上增加一个当前的函数声明
            const functionCode = generatorConstructFunction(
              classMethod,
              classMethod.kind
            );
            fns.push(functionCode);
            // console.log(functionCode, 'functionCode');
            // 当前作用域增加生成的普通构造函数结束
            // 这里不太对
            // nodePath.scope.push(functionCode);
          } else {
            // 不考虑静态 仅仅处理普通函数
            fns.push(generatorPrototypeCode(classMethod, classMethod.key.name));
          }
        });
        if (fns.length === 1) {
          // 直接替换节点
          nodePath.replaceWith(fns[0]);
        } else if (fns.length > 1) {
          nodePath.replaceWithMultiple(fns);
        }
      },
    },
  };
}

/**
 *
 * 根据类中构造函数节点生成ES5中的普通构造函数节点内容
 * @param {ASTNode} node Ast节点
 * @param {string} node 类名称
 */
function generatorConstructFunction(node, fnName) {
  // 获取对应参数
  const params = node.params;
  // 获取对应函数体内容
  const functionBody = node.body;
  const parseConstructor = babelTypes.functionExpression(
    babelTypes.identifier(fnName),
    params,
    functionBody,
    false,
    false
  );
  return parseConstructor;
}

// 需要当前节点 需要当前函数名

function generatorPrototypeCode(node, fnName) {
  // 生成左侧语句
  const leftExpression = babelTypes.memberExpression(
    // 当前对象
    babelTypes.memberExpression(
      babelTypes.identifier(fnName),
      babelTypes.identifier('prototype'),
      false,
      false
    ),
    // 访问的属性
    babelTypes.identifier('getName'),
    false,
    false
  );
  // 生成右侧语句
  const rightExpression = babelTypes.functionExpression(
    null,
    node.params,
    node.body,
    node.generator,
    node.async
  );
  // 生成对应的赋值表达式
  const prototypeCode = babelTypes.expressionStatement(
    babelTypes.assignmentExpression('=', leftExpression, rightExpression)
  );
  return prototypeCode;
}

module.exports = {
  transformClassPlugin,
};
