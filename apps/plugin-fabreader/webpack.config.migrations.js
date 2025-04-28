const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const glob = require('glob');

// Get all migration files
const migrationFiles = glob.sync('apps/plugin-fabreader/src/db/migrations/**/*.ts');
const migrationEntries = migrationFiles.reduce((acc, file) => {
  const key = './' + file.replace('apps/plugin-fabreader/src/db/', '');
  acc[key] = file;
  return acc;
}, {});

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/plugin-fabreader-datasource'),
    library: {
      type: 'commonjs2'
    }
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/db/datasource.ts',
      tsConfig: './tsconfig.app.json',
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
