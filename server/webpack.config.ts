import ForkTsCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import NodemonPlugin from 'nodemon-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, EnvironmentPlugin } from 'webpack';

const devMode = process.env.NODE_ENV !== 'production';

export default <Configuration>{
  mode: devMode ? 'development' : 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    chunkFilename: '[name].js',
    publicPath: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
  },
  devtool: devMode
    ? process.env.NODEMON
      ? 'eval-cheap-module-source-map'
      : 'inline-source-map'
    : 'source-map',
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [
    ...(process.env.NODEMON ? [new NodemonPlugin()] : []),
    new EnvironmentPlugin({
      WEBPACK: true,
    }),
    new ForkTsCheckerPlugin({
      async: devMode,
      typescript: {
        build: true,
        mode: 'write-tsbuildinfo',
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        profile: false,
      },
      eslint: { enabled: true, files: './src/**/*.{ts,js}' },
    }),
  ],
  stats: { preset: 'normal', colors: true },
  externalsPresets: { node: true },
  externals: [/^[^.][a-z\-0-9@/.]+$/],
  target: 'async-node',
  node: { __dirname: true },
  experiments: { topLevelAwait: true },
  optimization: {
    emitOnErrors: false,
    minimizer: devMode ? undefined : [new TerserPlugin()],
  },
  module: {
    rules: [
      { test: /\.js(x?)$/, enforce: 'pre', loader: 'source-map-loader' },
      { test: /\.ts(x?)/, loader: 'ts-loader', options: { transpileOnly: true } },
      { test: /\.mjs$/, include: /node_modules/, type: 'javascript/auto' },
    ],
  },
};
