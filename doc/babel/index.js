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
const babel = require('@babel/core');

// babel/types 工具库 该模块包含手动构建TS的方法，并检查AST节点的类型。(根据不同节点类型进行转化实现)
const babelTypes = require('@babel/types');

// 转化箭头函数的插件
const arrowFunction = require('@babel/plugin-transform-arrow-functions');

const sourceCode = "const a = () => console.log('Hello World')";

const targetCode = babel.transform(sourceCode, {
  plugins:[arrowFunction]
});

console.log(targetCode.code)