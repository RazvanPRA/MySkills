import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { ApiError, ApiErrorCode } from '@senior-prep/contracts';
import type { Response } from 'express';
import { ZodError } from 'zod';
import { ApiException } from './api-exception.js';

const CODE_BY_STATUS: Partial<Record<number, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'validation_failed',
  [HttpStatus.UNAUTHORIZED]: 'unauthorized',
  [HttpStatus.NOT_FOUND]: 'not_found',
  [HttpStatus.TOO_MANY_REQUESTS]: 'rate_limited',
};

/** Maps any exception to the contract's error shape; unknown errors never leak details. */
export function toApiError(exception: unknown): ApiError {
  if (exception instanceof ApiException) {
    return exception.getResponse() as ApiError;
  }
  if (exception instanceof ZodError) {
    const message = exception.issues.map(i => `${i.path.join('.') || 'body'}: ${i.message}`);
    return { statusCode: 400, code: 'validation_failed', message: message.join('; ') };
  }
  if (exception instanceof ThrottlerException) {
    return { statusCode: 429, code: 'rate_limited', message: 'Too many attempts, wait a minute' };
  }
  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    return {
      statusCode,
      code: CODE_BY_STATUS[statusCode] ?? 'internal',
      message: exception.message,
    };
  }
  return { statusCode: 500, code: 'internal', message: 'Something went wrong' };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Api');

  catch(exception: unknown, host: ArgumentsHost): void {
    const error = toApiError(exception);
    if (error.statusCode >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }
    host.switchToHttp().getResponse<Response>().status(error.statusCode).json(error);
  }
}
