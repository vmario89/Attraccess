/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import federation from '@originjs/vite-plugin-federation';
// import MillionLint from '@million/lint';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4200,
    host: '0.0.0.0',
  },
  preview: {
    port: 4300,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin([]),
    // MillionLint.vite(),
    federation({
      name: 'attraccess',
      remotes: {
        // Dynamic remotes will be loaded at runtime
        // dummy remote so that vite prepares the shared libs,
        // otherwise the shared libs are not loaded and the dynamic remotes are not working
        dummy: './dummy.js',
      },
      shared: {
        react: { requiredVersion: '*' },
        'react-dom': { requiredVersion: '*' },
        'react-router-dom': { requiredVersion: '*' },
        'react-pluggable': { requiredVersion: '*' },
        '@heroui/react': { requiredVersion: '*' },
        '@tanstack/react-query': { requiredVersion: '*' },
      },
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'esnext',
    minify: 'esbuild',
  },
});
