const core = require('@babel/core');
const babelPluginImport = require('./babel-plugin-import');

const sourceCode = `
  import { Button, Alert } from 'hy-store';
`;

const parseCode = core.transform(sourceCode, {
  plugins: [
    babelPluginImport({
      libraryName: 'hy-store',
    }),
  ],
});

console.log(sourceCode, '输入的Code');
console.log(parseCode.code, '输出的结果');
