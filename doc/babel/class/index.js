// const transformClass = require('@babel/plugin-transform-classes');
const core = require('@babel/core');
const { transformClassPlugin } = require('./plugin-transform-classes');

const sourceCode = `
  class Person {
    constructor (name){
      this.name = name
    }
    getName() {
      return this.name
    }
  }
`;


const parseCode = core.transform(sourceCode, {
  plugins: [
    transformClassPlugin({
      name: 'wang.haoyu',
    }),
  ],
});

// console.log(parseCode.code, 'parseCode');
