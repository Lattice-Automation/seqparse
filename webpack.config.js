const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const package = require("./package.json");

const webBuild = {
  entry: path.join(__dirname, "src", "index.ts"),
  target: "web",
  mode: "none",
  devtool: "source-map",
  optimization: {
    minimize: false,
  },
  output: {
    filename: "index.js",
    library: {
      name: package.name,
      type: "umd",
    },
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    umdNamedDefine: true,
  },
  module: {
    rules: [
      { test: /\.(t|j)sx?$/, loader: "ts-loader", exclude: /node_modules/ },
    ],
  },
  externals: [nodeExternals({ modulesDir: path.join(__dirname, "node_modules") })],
  resolve: {
    extensions: [".ts"],
    fallback: {
      buffer: require.resolve("buffer"),
      fs: false,
      net: false,
      tls: false,
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
      timers: require.resolve("timers-browserify"),
      url: require.resolve("url"),
    },
  },
};

const cliBuild = {
  ...webBuild,
  entry: path.join(__dirname, "src", "cli.ts"),
  target: "node",
  mode: "none",
  devtool: "source-map",
  optimization: {
    minimize: false,
  },
  output: {
    filename: "cli.js",
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    umdNamedDefine: true,
    chunkFormat: 'commonjs'
  },
  module: {
    rules: [
      { test: /\.(t|j)sx?$/, loader: "ts-loader", exclude: /node_modules/ },
    ],
  },
  // externals: [nodeExternals({ modulesDir: path.join(__dirname, "node_modules") })],
  resolve: {
    extensions: [".ts"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      timers: require.resolve("timers-browserify"),
      url: require.resolve("url"),
    },
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
//   experiments: {
//     outputModule: true,
// },
};

module.exports = [webBuild, cliBuild];
