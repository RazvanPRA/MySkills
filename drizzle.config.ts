import { defineConfig } from 'drizzle-kit';

// `driver: 'expo'` makes drizzle-kit emit migrations.js, which bundles the SQL files
// (inlined by babel-plugin-inline-import) so migrations run on the device without a file system.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
});
