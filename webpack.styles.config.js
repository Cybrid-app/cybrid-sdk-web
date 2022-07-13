const path = require('path'); // eslint-disable-line

module.exports = {
  entry: {
    styles: '/dist/library/styles.css'
  },
  output: {
    path: path.resolve(__dirname, 'dist/library'),
    filename: 'cybrid-sdk-ui.styles.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
