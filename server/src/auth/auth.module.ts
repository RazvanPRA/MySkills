import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MeController } from './me.controller';
import { REFRESH_TOKENS_REPOSITORY, USERS_REPOSITORY } from './repositories/auth.repositories';
import {
  PrismaRefreshTokensRepository,
  PrismaUsersRepository,
} from './repositories/prisma-auth.repositories';
import { TokensService } from './tokens.service';

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
