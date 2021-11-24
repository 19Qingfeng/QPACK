const path = require('path');
const fs = require('fs');
const { runLoaders } = require('./loader-runner');

// 入口模块
const filePath = path.resolve(__dirname, '../../src/index.js');

// 模拟引入
const request = 'inline1-loader!inline2-loader!./title.js';

// 模拟webpack配置
const rules = [
  // 普通loader
  {
    test: /\.js$/,
    use: ['normal1-loader', 'normal2-loader'],
  },
  // 前置loader
  {
    test: /\.js$/,
    use: ['pre1-loader', 'pre2-loader'],
    enforce: 'pre',
  },
  // 后置loader
  {
    test: /\.js$/,
    use: ['post1-loader', 'post2-loader'],
    enforce: 'post',
  },
];

// loader顺序
// pitch post -> inline -> normal -> pre
// normal pre -> normal -> inline -> post

// 提取inline loader
const parts = request.replace(/^-?!+/, '').split('!');
// 文件路径
const sourcePath = parts.pop();

// 解析loader的绝对路径
const resolveLoader = (loader) => path.resolve(__dirname, './loaders', loader);

const inlineLoaders = parts;

// 处理rules中的loader
const preLoaders = [],
  normalLoaders = [],
  postLoaders = [];

rules.forEach((rule) => {
  // 如果匹配情况下
  if (rule.test.test(sourcePath)) {
    switch (rule.enforce) {
      case 'pre':
        preLoaders.push(...rule.use);
        break;
      case 'post':
        postLoaders.push(...rule.use);
        break;
      default:
        normalLoaders.push(...rule.use);
        break;
    }
  }
});

/**
 * https://webpack.js.org/concepts/loaders/
 * !: 单个！开头，排除所有normal-loader.
 * !!: 两个!!开头 仅剩余 inline-loader 排除所有(pre,normal,post).
 * -!: -!开头将会禁用所有pre、normal类型的loader，剩余post和normal类型的.
 */
let loaders = [];
if (request.startsWith('!!')) {
  loaders.push(...inlineLoaders);
} else if (request.startsWith('-!')) {
  loaders.push(...postLoaders, ...inlineLoaders);
} else if (request.startsWith('!')) {
  loaders.push(...postLoaders, ...inlineLoaders, ...preLoaders);
} else {
  loaders.push(
    ...[...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders]
  );
}

loaders = loaders.map(resolveLoader);

/* 
  源码中
runLoaders(
			{
				resource: this.resource,
				loaders: this.loaders,
				context: loaderContext,
				processResource: (loaderContext, resourcePath, callback) => {
					const resource = loaderContext.resource;
					const scheme = getScheme(resource);
					hooks.readResource
						.for(scheme)
						.callAsync(loaderContext, (err, result) => {
							if (err) return callback(err);
							if (typeof result !== "string" && !result) {
								return callback(new UnhandledSchemeError(scheme, resource));
							}
							return callback(null, result);
						});
				}
			},
			(err, result) => {
				// Cleanup loaderContext to avoid leaking memory in ICs
				loaderContext._compilation =
					loaderContext._compiler =
					loaderContext._module =
					loaderContext.fs =
						undefined;

				if (!result) {
					this.buildInfo.cacheable = false;
					return processResult(
						err || new Error("No result from loader-runner processing"),
						null
					);
				}
				this.buildInfo.fileDependencies.addAll(result.fileDependencies);
				this.buildInfo.contextDependencies.addAll(result.contextDependencies);
				this.buildInfo.missingDependencies.addAll(result.missingDependencies);
				for (const loader of this.loaders) {
					this.buildInfo.buildDependencies.add(loader.loader);
				}
				this.buildInfo.cacheable = this.buildInfo.cacheable && result.cacheable;
				processResult(err, result.result);
			}
		);
	}
*/
// 运行loaders
// console.log(fs.readFileSync(filePath), '内容');
runLoaders(
  {
    resource: filePath, // 加载的模块路径
    loaders, // 需要处理的loader数组
    context: { name: '19Qingfeng' }, // 传递的上下文对象
    readResource: fs.readFile.bind(fs), // 读取文件的方法
    // processResource 参数先忽略
  },
  (error, result) => {
    // console.log(error, '存在的错误');
    // console.log(result, '结果');
  }
);
