const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: {
    popup: './popup.js',
    background: './background.js',
    content: './content.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@tgwf/co2': path.resolve(__dirname, 'node_modules/@tgwf/co2'),
    },
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
};