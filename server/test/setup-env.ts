import 'dotenv/config';

/**
 * End-to-end tests run against DATABASE_URL (local: the compose database). They delete all
 * rows first, so never point them at a database whose data matters.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ??= 'e2e-test-secret-e2e-test-secret-123456';
process.env.DATABASE_URL ??= 'postgresql://senior_prep:senior_prep_dev@localhost:5433/senior_prep';
