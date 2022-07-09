const path = require('path'); // eslint-disable-line
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
  {
    plugins: [
      new CopyPlugin({
        patterns: [{ from: path.resolve(__dirname, "dist/library/styles.css") }]
      })
    ],
    mode: 'production',
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    target: 'web',
    entry: ['/dist/library/library.js'],
    output: {
      path: path.resolve(__dirname, 'html-test'),
      filename: 'cybrid-sdk-ui.min.js',
      library: 'cybrid-sdk-ui-js',
      libraryTarget: 'umd'
    }
  }
];
