
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptService } from 'src/crypt/crypt.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService,
    private readonly jwtService: JwtService
  ) { }

  async signIn(username: string, passwordPlain: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (user && await this.cryptService.verifyPassword(passwordPlain, user.passwordHash)) {
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }
    else {
      throw new UnauthorizedException();
    }
  }
}
