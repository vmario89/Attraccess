const { join } = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const lazyImports = ['@nestjs/microservices', 'cache-manager', 'class-validator', 'class-transformer'];

module.exports = {
  entry: join(__dirname, '../../../dist/libs/plugin-fabreader/backend-js/src/fabreader.module.js'),
  output: {
    path: join(__dirname, '../../../dist/libs/plugin-fabreader/backend'),
    library: {
      type: 'commonjs2',
    },
  },
  target: 'node',
  mode: 'none',
  optimization: {
    nodeEnv: false,
  },
  node: {
    __filename: false,
    __dirname: false,
  },
  externals: [
    nodeExternals({
      externals: ['pg'],
    }),
  ],
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource, {
            paths: [process.cwd()],
          });
        } catch {
          return true;
        }
        return false;
      },
    }),
  ],
};
