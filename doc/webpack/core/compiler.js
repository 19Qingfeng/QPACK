class Compiler {
  constructor(options) {
    this.options = options;
  }
  run() {
    // 获取入口配置对象
    const entry = this.getEntry();
    console.log('开始编译工作', entry);
  }

  // 获取入口文件
  // TODO: 当然还有多入口数组配置支持
  getEntry() {
    let entry = Object.create(null);
    const { entry: optionsEntry } = this.options;
    if (typeof entry === 'string') {
      entry['main'] = optionsEntry;
    } else {
      entry = optionsEntry;
    }
    return entryObject;
  }
}

module.exports = Compiler;
