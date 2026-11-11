import { defineConfig, mergeConfig } from 'vitest/config';
import { base } from './vitest.base.js';

/** Unit tests: fast, no database, next to the code in __tests__/. */
export default mergeConfig(
  base,
  defineConfig({ test: { include: ['src/**/__tests__/**/*.spec.ts'] } }),
);
