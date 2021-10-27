const transformClass = require('@babel/plugin-transform-classes');
const core = require('@babel/core');

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
  plugins: [transformClass],
});

console.log(parseCode.code, 'parseCode');
