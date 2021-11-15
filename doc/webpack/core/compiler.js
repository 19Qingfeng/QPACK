const { SyncHook } = require('tapable');
const { toUnixPath } = require('../utils/index');
const path = require('path');

class Compiler {
  constructor(options) {
    // 获取参数
    this.options = options;
    // 创建plugin hooks
    this.hooks = {
      // 开始编译时的钩子
      run: new SyncHook(),
      // 输出 asset 到 output 目录之前执行 (写入文件之前)
      emit: new SyncHook(),
      // 在 compilation 完成时执行 全部完成编译执行
      done: new SyncHook(),
    };
    // 保存所有入口模块
    this.entries = new Set();
    // 所有的模块
    this.modules = new Set();
    // 所有的代码块
    this.chunks = new Set();
    // 存放本次产出的文件
    this.assets = new Set();
    // 存放本次编译所有产出的文件
    this.files = new Set();
  }
  run() {
    // 获取入口配置对象
    const entry = this.getEntry();
    // 从入口出发 编译相关所有模块
    console.log('开始编译工作', entry);
  }

  // 获取入口文件
  getEntry() {
    let entry = Object.create(null);
    const { entry: optionsEntry, context } = this.options;
    if (typeof entry === 'string') {
      entry['main'] = optionsEntry;
    } else {
      entry = optionsEntry;
    }
    // 将entry变成绝对路径
    const rootPath = context || process.cwd();
    Object.keys(entry).forEach((key) => {
      const value = entry[key];
      if (!path.isAbsolute(value)) {
        // 转化为绝对路径的同时统一路径分隔符为 /
        entry[key] = toUnixPath(path.join(rootPath, value));
      }
    });
    return entry;
  }
}

module.exports = Compiler;
