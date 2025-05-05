const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const glob = require('glob');

// Get all migration files
const migrationFiles = glob.sync('libs/plugin-fabreader/backend/src/db/migrations/**/*.ts');
const migrationEntries = migrationFiles.reduce((acc, file) => {
  const key = './' + file.replace('libs/plugin-fabreader/backend/src/db/', '');
  acc[key] = file;
  return acc;
}, {});

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/plugin-fabreader-datasource'),
    library: {
      type: 'commonjs2'
    }
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/db/datasource.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      deleteOutputPath: true,
    })
  ],
  externals: {
    typeorm: 'commonjs typeorm',
    tslib: 'commonjs tslib',
    zod: 'commonjs zod'
  },
  entry: {
    main: './src/db/datasource.ts',
    ...migrationEntries
  }
};
