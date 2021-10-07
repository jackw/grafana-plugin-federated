const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const _ = require('lodash');

const pluginPackageDeets = require('./package.json');
const deps = pluginPackageDeets.dependencies;
const pluginName = pluginPackageDeets.name;

module.exports = {
  mode: 'development',
  target: 'web',
  context: path.join(__dirname, 'src'),
  entry: {
    plugin: './plugin.ts',
  },
  devtool: 'source-map',
  output: {
    clean: true,
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'amd',
    publicPath: `/public/plugins/${pluginName}/`,
  },
  externals: [
    'lodash',
    'jquery',
    'moment',
    'slate',
    'emotion',
    '@emotion/react',
    '@emotion/css',
    'prismjs',
    'slate-plain-serializer',
    '@grafana/slate-react',
    'react-redux',
    // 'react',
    // 'react-dom',
    'redux',
    'rxjs',
    'react-router-dom',
    'd3',
    'angular',
    '@grafana/ui',
    '@grafana/runtime',
    '@grafana/data',
    function(context, request, callback) {
      var prefix = 'grafana/';
      if (request.indexOf(prefix) === 0) {
        return callback(null, request.substr(prefix.length));
      }
      callback();
    },
  ],
  plugins: [
    new ModuleFederationPlugin({
      name: _.snakeCase(pluginName),
      filename: 'module.js',
      remotes: {},
      exposes: {
        "./plugin": "./plugin.ts"
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
    new HtmlWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'plugin.json', to: '.' },
        { from: '../README.md', to: '.' },
        { from: '../CHANGELOG.md', to: '.' },
        { from: '../LICENSE', to: '.' },
        { from: 'img/*', to: '.' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      fs: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    moduleIds: 'named',
    runtimeChunk: true,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
