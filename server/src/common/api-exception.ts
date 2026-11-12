import { HttpException, type HttpStatus } from '@nestjs/common';
import type { ApiErrorCode } from '@senior-prep/contracts';

/** An error the API reports on purpose, with a stable code the app can translate. */
export class ApiException extends HttpException {
  constructor(readonly code: ApiErrorCode, status: HttpStatus, message: string) {
    super({ statusCode: status, code, message }, status);
  }
}
