import { Controller, Get } from '@nestjs/common';
import type { PingResponse } from '@senior-prep/contracts';

/** Behind the API key: the app calls it to check that its server URL and key are right. */
@Controller('ping')
export class PingController {
  @Get()
  ping(): PingResponse {
    return { status: 'ok' };
  }
}
