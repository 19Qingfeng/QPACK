const t = require('@babel/types');

function babelPluginImport(options) {
  const { libraryName = 'hy-store' } = options;
  return {
    visitor: {
      // 匹配ImportDeclaration时进入
      ImportDeclaration(nodePath) {
        // checked Validity
        if (checkedDefaultImport(nodePath) || checkedLibraryName(nodePath)) {
          return;
        }
        const node = nodePath.node;
        // 获取声明说明符
        const { specifiers } = node;
        // 遍历对应的声明符
        const importDeclarations = specifiers.map((specifier, index) => {
          // 获得原本导入的模块
          const moduleName = specifier.imported.name;
          // 获得导入时的重新命名
          const localIdentifier = specifier.local;
          return generateImportStatement(moduleName, localIdentifier);
        });
        if (importDeclarations.length === 1) {
          // 如果仅仅只有一个语句时
          nodePath.replaceWith(importDeclarations[0]);
        } else {
          // 多个声明替换
          nodePath.replaceWithMultiple(importDeclarations);
        }
      },
    },
  };

  // 检查导入是否是固定匹配库
  function checkedLibraryName(nodePath) {
    const { node } = nodePath;
    return node.source.value !== libraryName;
  }

  // 检查语句是否存在默认导入
  function checkedDefaultImport(nodePath) {
    const { node } = nodePath;
    const { specifiers } = node;
    return specifiers.some((specifier) =>
      t.isImportDefaultSpecifier(specifier)
    );
  }

  // 生成导出语句 将每一个引入更换为一个新的单独路径默认导出的语句
  function generateImportStatement(moduleName, localIdentifier) {
    return t.importDeclaration(
      [t.ImportDefaultSpecifier(localIdentifier)],
      t.StringLiteral(`${libraryName}/${moduleName}`)
    );
  }
}

module.exports = babelPluginImport;
