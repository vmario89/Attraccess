const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

const outputPath = resolve(join(__dirname, '../../../dist/libs/plugin-fabreader/backend'));
console.log('outputPath', outputPath);

module.exports = {
  output: {
    path: outputPath,
    library: {
      type: 'commonjs2'
    }
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/fabreader.module.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      deleteOutputPath: true,
    })
  ],
  entry: {
    main: './src/fabreader.module.ts',
  }
};
