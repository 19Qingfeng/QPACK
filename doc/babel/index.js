/**
 * babel插件
 * 主要还是@babel/core中的transform、parse 对于ast的处理
 * 以及babel/types 中各种转化规则
 *
 * Ast是一种深度优先遍历
 * 内部使用访问者(visitor)模式
 *
 * babel主要也是做的AST的转化
 *
 * 1. 词法分析 tokens : var a  = 1 ["var","a","=","1"]
 * 2. 语法分析 将tokens按照固定规则生成AST语法树
 * 3. 语法树转化 在旧的语法树基础上进行增删改查 生成新的语法书
 * 4. 生成代码 根据新的Tree生成新的代码
 */

// babel核心转化库 包含core -》 AST -》 code的转化实现
/* 
  babel/core 其实就可以相当于 es
  它会将原本的sourceCode转化为AST语法树
  遍历老的语法树
  遍历老的语法树时候 会检查传入的插件/或者第三个参数中传入的`visitor`
  修改对应匹配的节点 
  生成新的语法树
  之后生成新的代码地址
*/
const babel = require('@babel/core');

// babel/types 工具库 该模块包含手动构建TS的方法，并检查AST节点的类型。(根据不同节点类型进行转化实现)
const babelTypes = require('@babel/types');

// 转化箭头函数的插件
const arrowFunction = require('@babel/plugin-transform-arrow-functions');

const sourceCode = "const a = () => console.log('Hello World')";

const targetCode = babel.transform(sourceCode, {
  plugins: [arrowFunction],
});

// 简单的babel插件 先不涉及箭头函数中的this
// 所谓的babel插件就是一个对象
// 存在一个定死的属性 visitor
// visitor中会根据key去匹配对应的节点
const arrowFunctionPlugin = {
  visitor: {
    // 当语法树遍历到节点为arrowFunctionExpression时
    ArrowFunctionExpression(path) {
      const node = path.node;
      if (node.type === 'arrowFunctionExpression') {
        // 将改节点变成普通函数
        node.type = 'FunctionDeclaration';
      }
    },
  },
};

const targetCode2 = babel.transform(sourceCode, {
  plugins: [arrowFunctionPlugin],
});

console.log(targetCode2.code);
