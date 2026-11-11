import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * Shared by the unit and end-to-end configs.
 * SWC (not esbuild) compiles the tests because NestJS needs `emitDecoratorMetadata` for
 * constructor injection, which esbuild does not emit.
 */
export const base = defineConfig({
  plugins: [swc.vite()],
  resolve: {
    // The contracts' TypeScript source, so tests never depend on a stale build of the package.
    alias: {
      '@senior-prep/contracts': fileURLToPath(
        new URL('../packages/contracts/src/index.ts', import.meta.url),
      ),
    },
  },
  test: { globals: true, environment: 'node' },
});
