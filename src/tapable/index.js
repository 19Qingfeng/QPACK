const { SyncHook } = require('tapable');

const hooks = new SyncHook();

hooks.tap(
  {
    name: 'flag1',
    stage: 1,
  },
  () => {
    console.log('This is flag1 function.');
  }
);

hooks.tap(
  {
    name: 'flag2',
    // 默认为stage: 0,
  },
  () => {
    console.log('This is flag2 function.');
  }
);

hooks.call();
