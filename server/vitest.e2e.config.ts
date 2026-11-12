import { defineConfig, mergeConfig } from 'vitest/config';
import { base } from './vitest.base.js';

/**
 * End-to-end tests: the real app over HTTP against a real PostgreSQL (DATABASE_URL). Files run
 * one at a time because they share, and empty, the same database.
 */
export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: ['test/**/*.e2e-spec.ts'],
      setupFiles: ['test/setup-env.ts'],
      fileParallelism: false,
    },
  }),
);
