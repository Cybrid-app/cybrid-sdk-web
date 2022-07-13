const path = require('path'); // eslint-disable-line

module.exports = [
  {
    mode: 'production',
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    target: 'web',
    entry: ['/dist/library/cybrid-sdk-ui.min.js'],
    output: {
      path: path.resolve(__dirname, 'dist/library'),
      filename: 'cybrid-sdk-ui.min.js',
      library: 'cybrid-sdk-ui-js',
      libraryTarget: 'umd'
    }
  }
];
