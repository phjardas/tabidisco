const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const prod = process.env.NODE_ENV === 'production';

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

const extractScss = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: !prod,
});

module.exports = {
  mode: prod ? 'production' : 'development',
  entry: {
    app: path.resolve(APP_DIR, 'index.js'),
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].[hash].js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: APP_DIR,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: extractScss.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        }),
      },
    ],
  },
  plugins: [
    extractScss,
    new HtmlWebpackPlugin({
      inject: false,
      template: require('html-webpack-template'),
      title: 'Tabidisco',
      mobile: true,
      appMountId: 'root',
      favicon: 'src/favicon.ico',
      scripts: ['https://use.fontawesome.com/releases/v5.0.6/js/solid.js', 'https://use.fontawesome.com/releases/v5.0.6/js/fontawesome.js'],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
  ],
  devServer: {
    //hot: true,
    historyApiFallback: true,
    port: 3000,
  },
};
