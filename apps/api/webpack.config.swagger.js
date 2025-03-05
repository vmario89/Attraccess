const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api-swagger'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.export-swagger.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
    new webpack.DefinePlugin({
      'process.env.AUTH_JWT_ORIGIN': JSON.stringify('ENV'),
      'process.env.AUTH_JWT_SECRET': JSON.stringify('not-set'),
      'process.env.FRONTEND_URL': JSON.stringify('http://localhost:4200'),
      'process.env.SMTP_HOST': JSON.stringify('localhost'),
      'process.env.SMTP_PORT': JSON.stringify('1025'),
      'process.env.SMTP_USER': JSON.stringify('no-reply@attraccess.local'),
      'process.env.SMTP_PASS': JSON.stringify(''),
      'process.env.SMTP_FROM': JSON.stringify('no-reply@attraccess.local'),
    }),
  ],
};
