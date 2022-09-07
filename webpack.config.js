const path = require("path");
const nodeExternals = require("webpack-node-externals");

const package = require("./package.json");

/**
 * npmBuild is the same as CDN build except node_modules are ignored as externals and the output filename differs.
 */
const npmBuild = {
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
      string_decoder: require.resolve("string_decoder"),
      stream: require.resolve("stream-browserify"),
      timers: require.resolve("timers-browserify"),
      url: require.resolve("url"),
    },
  },
};

module.exports = [npmBuild];
