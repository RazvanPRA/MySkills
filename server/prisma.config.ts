import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 does not read .env by itself: dotenv above loads it for the CLI.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
