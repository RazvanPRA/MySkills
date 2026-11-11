import { Controller, Get } from '@nestjs/common';
import { Public } from '../api-key/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Liveness and database reachability, for Docker / the host's health checks (no API key). */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check(): Promise<{ status: 'ok'; database: 'ok' }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'ok' };
  }
}
