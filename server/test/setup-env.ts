import 'dotenv/config';

/**
 * End-to-end tests run against DATABASE_URL (local: the compose database). Never point them at
 * a database whose data matters: later suites delete rows to start from a known state.
 */
process.env.NODE_ENV = 'test';
process.env.API_KEY ??= 'e2e-only-api-key-e2e-only-api-key-123456';
process.env.DATABASE_URL ??= 'postgresql://senior_prep:senior_prep_dev@localhost:5433/senior_prep';
