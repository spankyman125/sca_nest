
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CryptService } from 'src/crypt/crypt.service';
import bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService
  ) { }

  async signIn(username: string, passwordPlain: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (user && await this.cryptService.verifyPassword(passwordPlain, user.passwordHash)) {
      return true;
    }
    else {
      throw new UnauthorizedException();
    }
  }
}
