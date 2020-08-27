const { createConfig } = require('@edx/frontend-build');

const path = require('path');

module.exports = createConfig('webpack-dev', {
  resolve: {
    alias: {
      plugins: path.resolve(__dirname, 'plugins/'),
    },
  },
});

console.log(module.exports);
