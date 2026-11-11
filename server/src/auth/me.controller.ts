import { Controller, Get, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import type { Me } from '@senior-prep/contracts';
import { ApiException } from '../common/api-exception';
import { CurrentUserId, JwtAuthGuard } from './jwt-auth.guard';
import { USERS_REPOSITORY, type UsersRepository } from './repositories/auth.repositories';

/** The signed-in account. */
@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(@Inject(USERS_REPOSITORY) private readonly users: UsersRepository) {}

  @Get()
  async me(@CurrentUserId() userId: string): Promise<Me> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new ApiException('unauthorized', HttpStatus.UNAUTHORIZED, 'Account no longer exists');
    }
    return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() };
  }
}
