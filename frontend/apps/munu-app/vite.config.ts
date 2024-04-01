import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import mkcert from 'vite-plugin-mkcert';
import { loadEnv } from 'vite';
import type { UserConfigExport } from 'vitest/config';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const testFiles = ['./src/**/*.test.{js,jsx,ts,tsx}'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const config: UserConfigExport = {
    plugins: [
      mkcert(),
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      tsconfigPaths(),
      svgr({
        // Set it to `true` to export React component as default.
        // Notice that it will override the default behavior of Vite.
        exportAsDefault: true,
        // svgr options: https://react-svgr.com/docs/options/
        svgrOptions: {},
      }),
    ] as any,
    test: {
      globals: true,
      environment: 'happy-dom',
      passWithNoTests: true,
      cache: {
        dir: '../../.cache/vitest/munu-app',
      },
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'clover'],
        extension: ['js', 'jsx', 'ts', 'tsx'],
      },
      include: testFiles,
      // To mimic Jest behaviour regarding mocks.
      // @link https://vitest.dev/config/#clearmocks
      clearMocks: true,
      mockReset: true,
      restoreMocks: true,
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      global: 'globalThis',
    },
    resolve: {
      alias: {
        stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        events: 'rollup-plugin-node-polyfills/polyfills/events',
        assert: 'assert',
        crypto: 'crypto-browserify',
        util: 'util',
        'near-api-js': 'near-api-js/dist/near-api-js.js',
      },
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        plugins: [nodePolyfills({ crypto: true }) as any],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          NodeGlobalsPolyfillPlugin({ buffer: true }) as any,
          {
            name: 'fix-node-globals-polyfill',
            setup(build) {
              build.onResolve(
                { filter: /_virtual-process-polyfill_\.js/ },
                ({ path }) => ({ path })
              );
            },
          },
        ],
      },
    },
  };

  return config;
});
