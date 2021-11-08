const core = require('@babel/core');
const t = require('@babel/types');

function babelPluginImport(options) {
  const { libraryName = 'hy-store' } = options;
  return {
    visitor: {
      ImportDeclaration(nodePath) {
        if (checkedDefaultImport(nodePath) || checkedLibraryName(nodePath)) {
          return;
        }
        const node = nodePath.node;
        const { specifiers } = node;
        const importDeclarations = specifiers.map((specifier, index) => {
          const moduleName = specifier.imported.name;
          const localIdentifier = specifier.local;
          return generateImportStatement(moduleName, localIdentifier);
        });
        if (importDeclarations.length === 1) {
          nodePath.replaceWith(importDeclarations[0]);
        } else {
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
