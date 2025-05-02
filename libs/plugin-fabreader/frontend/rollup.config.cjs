const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');
const replace = require('@rollup/plugin-replace');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: '../../../dist/libs/plugin-fabreader/frontend',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: ["react", "react-router-dom"],
    format: ['esm'],
    assets: [{ input: '.', output: '.', glob: 'README.md' }],
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    output: {
      inlineDynamicImports: true,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify( 'production' )
      }),
      svg({
        svgo: false,
        titleProp: true,
        ref: true,
      }),
      url({
        limit: 10000, // 10kB
      }),
    ],
  }
);
