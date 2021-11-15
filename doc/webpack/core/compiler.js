const { SyncHook } = require('tapable');
const { toUnixPath, tryExtensions } = require('../utils/index');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');
const path = require('path');
const fs = require('fs');
/* 
  真实源码中读取文件 多入口打包其实是可以并行的
  这里为了演示流程 所以使用同步代码
*/
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
    // 相对路径跟路径 Context参数
    this.rootPath = this.options.context || process.cwd();
    // 保存所有入口模块
    this.entries = new Set();
    // 保存所有依赖模块
    this.modules = new Set();
    // 所有的代码块
    this.chunks = new Set();
    // 存放本次产出的文件
    this.assets = new Set();
    // 存放本次编译所有产出的文件
    this.files = new Set();
  }
  run() {
    // 触发开始编译的plugin
    this.hooks.run.call();
    // 获取入口配置对象
    const entry = this.getEntry();
    // 从入口出发 编译相关所有模块
    this.buildEntryModule(entry);
  }

  // 编译入口文件
  buildEntryModule(entry) {
    Object.keys(entry).forEach((entryName) => {
      const entryPath = entry[entryName];
      // 一个一个去编译
      this.entries.add(this._buildEntryModule(entryName, entryPath));
    });
    console.log(this.entries);
    console.log(this.modules, 'modules');
  }

  // 编译模块
  _buildEntryModule(entryName, entryPath) {
    // 1. 读取此模块的内容
    const originSourceCode = (this.originSourceCode = fs.readFileSync(
      entryPath,
      'utf-8'
    ));
    this.moduleCode = originSourceCode;
    // 2. 调用所有的loader对模块进行编译
    this.handleLoader(entryName, entryPath);
    // 3. 查找所有依赖模块，重新递归loader处理步骤
    /* 
      这里 通过每一个模块相对于启动目录的相对路径(一定是唯一的)作为模块ID
      同时 使用path.posix保证不同操作系统下的relative方法返回的分隔符都是'/'
    */
    const moduleId = './' + path.posix.relative(this.rootPath, entryPath);
    const module = {
      id: moduleId,
      dependencies: new Set(),
      name: entryName,
    };
    // AST分析模块代码 处理依赖关系
    const ast = parser.parse(this.moduleCode, {
      sourceType: 'module',
    });
    // 深度优先 遍历语法Tree
    traverse(ast, {
      CallExpression: (nodePath) => {
        const node = nodePath.node;
        // 处理require语句
        if (node.callee.name === 'require') {
          // 引入模块相对路径
          const moduleName = node.arguments[0].value;
          // 寻找模块绝对路径 当前模块路径+require()对应相对路径
          // 同时tryExtensions 为模块增加依赖
          const moduleDirName = path.posix.dirname(entryPath);
          const absolutePath = tryExtensions(
            path.posix.join(moduleDirName, moduleName),
            this.options.resolve.extensions,
            moduleName,
            moduleDirName
          );
          // 生成moduleId - 针对于跟路径的模块ID 添加进入新的依赖模块路径
          const moduleId =
            './' + path.posix.relative(this.rootPath, absolutePath);
          module.dependencies.add(moduleId);
          // 通过修改require语句引入的模块 全部修改变为相对于跟路径来处理
          node.arguments = [t.stringLiteral(moduleId)];
        }
      },
    });
    // 遍历完成后 根据AST重新生成code
    const { code } = generator(ast);
    module._source = code; // 这个模块的源代码
    // 入口模块编译完成 接下来开始递归编译(深度优先)
    module.dependencies.forEach((dependency) => {
      const depModule = this._buildEntryModule(entryName, dependency);
      this.modules.add(depModule);
    });
    return module;
  }

  // loader逻辑处理
  handleLoader(entryName, entryPath) {
    // 2.1 找到匹配该文件内容对应的loader
    const rules = this.options.module.rules;
    const matchLoaders = [];
    rules.forEach((loader) => {
      const testRule = loader.test;
      // 简单字符串处理 暂不考虑loader中的对象形式
      if (testRule.test(entryPath)) {
        if (loader.loader) {
          matchLoaders.push(loader.loader);
        } else {
          matchLoaders.push(...loader.use);
        }
      }
    });
    // 2.2 倒序执行loader
    for (let i = matchLoaders.length - 1; i >= 0; i--) {
      // 目前我们仅仅支持传入的是绝对路径
      const loaderFn = require(matchLoaders[i]);
      this.moduleCode = loaderFn(this.moduleCode);
    }
  }

  // 获取入口文件
  getEntry() {
    let entry = Object.create(null);
    const { entry: optionsEntry } = this.options;
    if (typeof entry === 'string') {
      entry['main'] = optionsEntry;
    } else {
      entry = optionsEntry;
    }
    // 将entry变成绝对路径
    Object.keys(entry).forEach((key) => {
      const value = entry[key];
      if (!path.isAbsolute(value)) {
        // 转化为绝对路径的同时统一路径分隔符为 /
        entry[key] = toUnixPath(path.join(this.rootPath, value));
      }
    });
    return entry;
  }
}

module.exports = Compiler;
