import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

/**
 * Validates a request body with a contract schema. The same schema validates on the app, so
 * both ends agree by construction; a ZodError becomes a 400 `validation_failed`.
 */
export class ZodPipe<T extends z.ZodType> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    return this.schema.parse(value);
  }
}
