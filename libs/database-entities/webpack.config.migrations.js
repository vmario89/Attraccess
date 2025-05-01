const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const glob = require('glob');

// Get all migration files
const migrationFiles = glob.sync('libs/database-entities/src/lib/migrations/**/*.ts');
const migrationEntries = migrationFiles.reduce((acc, file) => {
  const key = './' + file.replace('libs/database-entities/src/lib/migrations/', '');
  acc[key] = file;
  return acc;
}, {});

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/database-entities-datasource'),
    library: {
      type: 'commonjs2'
    }
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/lib/datasource.ts',
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
    main: './src/lib/datasource.ts',
    ...migrationEntries
  }
};
