import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  EmailTakenError,
  type RefreshTokensRepository,
  type UserRecord,
  type UsersRepository,
} from './auth.repositories.js';

/** PostgreSQL unique-constraint violation, as reported by Prisma. */
const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(user: { email: string; passwordHash: string }): Promise<UserRecord> {
    try {
      return await this.prisma.user.create({ data: user });
    } catch (error) {
      const known = error instanceof Prisma.PrismaClientKnownRequestError;
      throw known && error.code === UNIQUE_VIOLATION ? new EmailTakenError() : error;
    }
  }
}

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(token: { userId: string; familyId: string; tokenHash: string; expiresAt: Date }) {
    await this.prisma.refreshToken.create({ data: token });
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, familyId: true, expiresAt: true, revokedAt: true },
    });
  }

  async markUsed(id: string, at: Date): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: at },
    });
    return count === 1;
  }

  async revokeFamily(familyId: string, at: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: at },
    });
  }
}
