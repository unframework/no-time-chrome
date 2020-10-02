const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const bundleOutputPath = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    contentTwitter: './src/contentTwitter.ts',
    background: './src/background.ts'
  },
  output: {
    path: bundleOutputPath,
    publicPath: '/',
    filename: '[name]_bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false
              }
            }
          }
        ],
        exclude: /node_modules/
      },

      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      {
        test: /\.(jpg|jpeg|gif|png|svg|eot|ttf|woff2|woff|truetype)$/,
        use: 'file-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: 'cheap-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['background'],
      filename: 'background.html',
      template: 'src/background.html'
    }),
    new CopyWebpackPlugin({ patterns: [{ from: 'src/meta' }] })
  ]
};
