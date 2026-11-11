import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { credentialsSchema } from '@senior-prep/contracts';
import { loadEnv } from '../../config/env';
import { ApiException } from '../api-exception';
import { toApiError } from '../api-exception.filter';
import { ZodPipe } from '../zod.pipe';

describe('toApiError', () => {
  it('keeps the code of intentional API errors', () => {
    expect(toApiError(new ApiException('email_taken', HttpStatus.CONFLICT, 'Taken'))).toEqual({
      statusCode: 409,
      code: 'email_taken',
      message: 'Taken',
    });
  });

  it('turns validation errors into 400 validation_failed with the field', () => {
    const pipe = new ZodPipe(credentialsSchema);
    let thrown: unknown;
    try {
      pipe.transform({ email: 'not-an-email', password: 'short' });
    } catch (error) {
      thrown = error;
    }
    expect(toApiError(thrown)).toMatchObject({ statusCode: 400, code: 'validation_failed' });
    expect(toApiError(thrown).message).toMatch(/email/);
  });

  it('maps rate limiting and framework errors', () => {
    expect(toApiError(new ThrottlerException()).code).toBe('rate_limited');
    expect(toApiError(new NotFoundException()).code).toBe('not_found');
  });

  it('never leaks details of unexpected errors', () => {
    expect(toApiError(new Error('connection string with password'))).toEqual({
      statusCode: 500,
      code: 'internal',
      message: 'Something went wrong',
    });
  });
});

describe('ZodPipe', () => {
  it('returns the parsed, normalized value', () => {
    const pipe = new ZodPipe(credentialsSchema);
    expect(pipe.transform({ email: ' Ana@Example.COM ', password: 'twelve chars!' })).toEqual({
      email: 'ana@example.com',
      password: 'twelve chars!',
    });
  });
});

describe('loadEnv', () => {
  const base = {
    DATABASE_URL: 'postgresql://u:p@localhost:5433/db',
    JWT_ACCESS_SECRET: 'x'.repeat(32),
  };

  it('applies defaults', () => {
    expect(loadEnv(base)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      ACCESS_TOKEN_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_DAYS: 30,
    });
  });

  it('refuses to start with a weak secret or no database', () => {
    expect(() => loadEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
    expect(() => loadEnv({ JWT_ACCESS_SECRET: 'x'.repeat(32) })).toThrow(/DATABASE_URL/);
  });
});
