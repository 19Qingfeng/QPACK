const { SyncHook } = require('tapable');
const { toUnixPath, tryExtensions, getSourceCode } = require('../utils/index');
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
// TODO: 代码整理
// TODO: 有问题 循环依赖会导致爆栈 解决方式: 目前想到通过cache形式
// TODO: 同步sync变成异步处理
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
    this.rootPath = this.options.context || toUnixPath(process.cwd());
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
  run(callback) {
    // 触发开始编译的plugin
    this.hooks.run.call();
    // 获取入口配置对象
    const entry = this.getEntry();
    // 从入口出发 编译相关所有模块
    this.buildEntryModule(entry);
    // 导出列表;之后将每个chunk转化称为单独的文件加入到输出列表assets中
    this.exportFile(callback);
  }

  // 编译入口文件
  buildEntryModule(entry) {
    Object.keys(entry).forEach((entryName) => {
      const entryPath = entry[entryName];
      // 一个一个入口去编译依赖关系
      const entryModule = this._buildEntryModule(entryName, entryPath);
      this.entries.add(entryModule);
      // 根据当前入口文件和模块的相互依赖关系，组装成为一个个包含当前入口所有依赖模块的chunk
      // TODO: 有问题 依赖会被相同入口引用时缺少
      const chunk = {
        name: entryName,
        entryModule,
        modules: Array.from(this.modules).filter((i) =>
          i.name.includes(entryName)
        ),
      };
      this.chunks.add(chunk);
    });
  }

  // 将chunk加入输出列表中去
  exportFile(callback) {
    const output = this.options.output;
    // 根据chunks生成assets内容
    this.chunks.forEach((chunk) => {
      const parseFileName = output.filename.replace('[name]', chunk.name);
      // assets中 { 'main.js': '生成的字符串代码...' }
      this.assets[parseFileName] = getSourceCode(chunk);
    });
    // 先判断目录是否存在 存在直接fs.write 不存在则首先创建
    if (!fs.existsSync(output.path)) {
      fs.mkdirSync(output.path);
    }
    // files中保存所有的生成文件名
    this.hooks.emit.call();
    this.files = Object.keys(this.assets);
    // 将assets中的内容生成打包文件 写入文件系统中
    Object.keys(this.assets).forEach((fileName) => {
      const filePath = path.join(output.path, fileName);
      fs.writeFileSync(filePath, this.assets[fileName]);
    });
    // 结束之后触发钩子
    this.hooks.done.call();
    callback(null, {
      toJson: () => {
        return {
          entries: this.entries,
          modules: this.modules,
          files: this.files,
          chunks: this.chunks,
          assets: this.assets,
        };
      },
    });
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
    // 创建模块对象
    const module = {
      id: moduleId,
      dependencies: new Set(), // 依赖模块绝对路径地址
      name: [entryName], // 该模块所属的入口文件
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
          // 通过babel修改require变成__webpack_require__语句
          node.callee = t.identifier('__webpack_require__');
          // 通过修改require语句引入的模块 全部修改变为相对于跟路径来处理
          node.arguments = [t.stringLiteral(moduleId)];
          // 解决多次引用相同模块 当前模块已经编译过的话那么就不进行依赖收集了
          const alreadyModule = Array.from(this.modules).map((i) => i.id);
          // 依赖已经编译过一次 直接添加进入就好了
          if (!alreadyModule.includes(moduleId)) {
            module.dependencies.add(moduleId);
          } else {
            // 修改内部的当前文件
            this.modules.forEach((value) => {
              if (value.id === moduleId) {
                value.name.push(entryName);
              }
            });
          }
        }
      },
    });
    // 遍历完成后 根据AST重新生成code
    const { code } = generator(ast);
    module._source = code; // 这个模块的源代码
    // 入口模块编译完成 接下来开始递归编译(深度优先)
    // TODO: 有问题 循环依赖会导致爆栈
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
