/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { join } from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import federation from '@originjs/vite-plugin-federation';

const sharedLibs = ['react', 'react-dom', 'react-pluggable', '@heroui/react', '@tanstack/react-query'];

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/plugin-fabreader/frontend',
  define: {
    'process.env': {},
    preventAssignment: true,
  },
  plugins: [
    federation({
      name: 'plugin-fabreader',
      filename: 'remoteEntry.js',
      // Modules to expose
      exposes: {
        './plugin': './src/fabreader.plugin',
      },
      shared: sharedLibs,
    }),
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({ entryRoot: 'src', tsconfigPath: join(__dirname, 'tsconfig.lib.json') }),
  ],
  esbuild: {
    supported: {
      'top-level-await': true, //browsers can handle top-level-await features
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../../dist/libs/plugin-fabreader/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'plugin-fabreader-frontend',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      // external: sharedLibs,
      output: {
        format: 'esm',
        minifyInternalExports: false,
        entryFileNames: 'assets/[name].js',
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/plugin-fabreader/frontend',
      provider: 'v8',
    },
    passWithNoTests: true,
  },
});
