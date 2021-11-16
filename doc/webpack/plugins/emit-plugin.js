class EmitPlugins {
  constructor() {}
  apply(compiler) {
    compiler.hooks.emit.tap('EmitPlugin', () => {
      // compiler['assets']['readme.md'] = '# i am 19Qingfeng!';
    });
  }
}

module.exports = EmitPlugins;
