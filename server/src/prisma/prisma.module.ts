import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/** Only repositories inject PrismaService; services depend on repository interfaces. */
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
