const transformClassPlugin = () => {
  return {
    visitor: {
      ClassDeclaration(nodePath) {
        console.log(nodePath);
      },
    },
  };
};
