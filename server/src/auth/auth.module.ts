import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { MeController } from './me.controller.js';
import { REFRESH_TOKENS_REPOSITORY, USERS_REPOSITORY } from './repositories/auth.repositories.js';
import {
  PrismaRefreshTokensRepository,
  PrismaUsersRepository,
} from './repositories/prisma-auth.repositories.js';
import { TokensService } from './tokens.service.js';

/** Accounts and tokens. Other modules protect routes with JwtAuthGuard + CurrentUserId. */
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    TokensService,
    JwtAuthGuard,
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
    { provide: REFRESH_TOKENS_REPOSITORY, useClass: PrismaRefreshTokensRepository },
  ],
  exports: [JwtAuthGuard, TokensService],
})
export class AuthModule {}
