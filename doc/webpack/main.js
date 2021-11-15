const name = require('./dep');
const second = require('./second');
// const index1 = require('./src/index1');
console.log(index1, '循环依赖');
console.log(name, '引入的name');
console.log('This is is main entry.');
