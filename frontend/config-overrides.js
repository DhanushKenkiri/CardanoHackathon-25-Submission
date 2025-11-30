const webpack = require('webpack');

module.exports = function override(config, env) {
  // Fix for allowedHosts error in webpack-dev-server
  if (config.devServer) {
    config.devServer.allowedHosts = 'all';
  }

  // Add polyfills for Node.js core modules (required for Cardano/Mesh SDK)
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    util: require.resolve('util'),
    process: require.resolve('process/browser.js'),
    vm: false, // vm is not available in browser
    fs: false, // fs is not available in browser
    path: false, // path is not available in browser  
  });
  config.resolve.fallback = fallback;

  // Fix for ESM modules expecting fully specified imports
  config.resolve.fullySpecified = false;

  // Add plugins for Buffer and process global
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  // Ignore source-map-loader warnings for @cardano-sdk packages
  config.ignoreWarnings = [/Failed to parse source map/];
  
  // Disable source maps for node_modules to reduce warnings
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.map(oneOfRule => {
        if (oneOfRule.loader && oneOfRule.loader.includes('source-map-loader')) {
          return {
            ...oneOfRule,
            exclude: /node_modules/,
          };
        }
        return oneOfRule;
      });
    }
    return rule;
  });

  return config;
};
