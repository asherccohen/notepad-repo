const { override } = require('customize-cra');

const removeLegacyDecorators = () => (config) => {
  const babelLoader = config.module.rules
    .find((rule) => Array.isArray(rule.oneOf)).oneOf
    .find((rule) => rule.loader && rule.loader.includes('babel-loader'));

  if (babelLoader && babelLoader.options && Array.isArray(babelLoader.options.plugins)) {
    babelLoader.options.plugins = babelLoader.options.plugins.filter(
      (plugin) =>
        !(Array.isArray(plugin) && plugin[0].includes('proposal-decorators'))
    );
  }

  return config;
};

const addNewDecorators = () => (config) => {
  const babelLoader = config.module.rules
    .find((rule) => Array.isArray(rule.oneOf)).oneOf
    .find((rule) => rule.loader && rule.loader.includes('babel-loader'));

  if (babelLoader && babelLoader.options && Array.isArray(babelLoader.options.plugins)) {
    babelLoader.options.plugins.unshift([
      require.resolve('@babel/plugin-proposal-decorators'),
      { version: '2023-05' },
    ]);
  }

  return config;
};

module.exports = override(
  removeLegacyDecorators(),
  addNewDecorators()
);