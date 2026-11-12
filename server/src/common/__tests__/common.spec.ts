import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { loadEnv } from '../../config/env.js';
import { ApiException } from '../api-exception.js';
import { toApiError } from '../api-exception.filter.js';
import { ZodPipe } from '../zod.pipe.js';

const noteSchema = z.object({ title: z.string().trim().min(1), tags: z.array(z.string()) });

describe('toApiError', () => {
  it('keeps the code of intentional API errors', () => {
    expect(toApiError(new ApiException('unauthorized', HttpStatus.UNAUTHORIZED, 'No'))).toEqual({
      statusCode: 401,
      code: 'unauthorized',
      message: 'No',
    });
  });

  it('turns validation errors into 400 validation_failed with the field', () => {
    const pipe = new ZodPipe(noteSchema);
    let thrown: unknown;
    try {
      pipe.transform({ title: '', tags: [] });
    } catch (error) {
      thrown = error;
    }
    expect(toApiError(thrown)).toMatchObject({ statusCode: 400, code: 'validation_failed' });
    expect(toApiError(thrown).message).toMatch(/title/);
  });

  it('maps framework errors by status', () => {
    expect(toApiError(new NotFoundException()).code).toBe('not_found');
    expect(toApiError(new HttpException('Slow down', HttpStatus.TOO_MANY_REQUESTS)).code).toBe(
      'rate_limited',
    );
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
    const pipe = new ZodPipe(noteSchema);
    expect(pipe.transform({ title: '  Hooks ', tags: ['react'] })).toEqual({
      title: 'Hooks',
      tags: ['react'],
    });
  });
});

describe('loadEnv', () => {
  const base = { DATABASE_URL: 'postgresql://u:p@localhost:5433/db', API_KEY: 'k'.repeat(32) };

  it('applies defaults', () => {
    expect(loadEnv(base)).toMatchObject({ NODE_ENV: 'development', PORT: 3000 });
  });

  it('refuses to start with a weak API key or no database', () => {
    expect(() => loadEnv({ ...base, API_KEY: 'short' })).toThrow(/API_KEY/);
    expect(() => loadEnv({ DATABASE_URL: base.DATABASE_URL })).toThrow(/API_KEY/);
    expect(() => loadEnv({ API_KEY: base.API_KEY })).toThrow(/DATABASE_URL/);
  });
});
