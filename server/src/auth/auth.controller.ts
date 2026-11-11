import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  type Credentials,
  credentialsSchema,
  type RefreshRequest,
  refreshRequestSchema,
  type TokenPair,
} from '@senior-prep/contracts';
import { ZodPipe } from '../common/zod.pipe';
import { AuthService } from './auth.service';

/** Sign-up, sign-in and token rotation. Rate-limited per client against brute force. */
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body(new ZodPipe(credentialsSchema)) body: Credentials): Promise<TokenPair> {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodPipe(credentialsSchema)) body: Credentials): Promise<TokenPair> {
    return this.auth.login(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body(new ZodPipe(refreshRequestSchema)) body: RefreshRequest): Promise<TokenPair> {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body(new ZodPipe(refreshRequestSchema)) body: RefreshRequest): Promise<void> {
    return this.auth.logout(body.refreshToken);
  }
}
