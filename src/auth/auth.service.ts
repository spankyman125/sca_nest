import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptService } from 'src/crypt/crypt.service';
import { jwtSecret } from './secret';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayload } from 'src/users/user.decorator';
import { randomUUID } from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptService: CryptService,
    private readonly jwtService: JwtService,
  ) {}

  extractToken(headers): string | undefined {
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async verifyToken(token: string | undefined): Promise<UserPayload> {
    if (!token) {
      throw new UnauthorizedException('Auth token not provided');
    }
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Bad auth token');
    }
  }

  async signIn(username: string, passwordPlain: string) {
    const user = await this.prismaService.user.findFirst({
      where: { username: username },
      select: {
        id: true,
        passwordHash: true,
        username: true,
      },
    });
    if (
      user &&
      (await this.cryptService.verifyPassword(passwordPlain, user.passwordHash))
    ) {
      const refreshToken = randomUUID();
      await this.prismaService.user.update({
        where: { username: username },
        data: { refreshToken: refreshToken },
      });
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: refreshToken,
      };
    } else {
      throw new UnauthorizedException('Wrong username of password');
    }
  }

  async refreshTokens(refreshToken: string) {
    const user = await this.prismaService.user.findFirst({
      where: { refreshToken: refreshToken },
      select: {
        id: true,
        passwordHash: true,
        username: true,
        refreshToken: true,
      },
    });
    if (refreshToken === user?.refreshToken) {
      const payload = { username: user.username, sub: user.id };
      const newRefreshToken = randomUUID();
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: newRefreshToken,
      };
    } else throw new UnauthorizedException('Wrong refresh token');
  }
}
