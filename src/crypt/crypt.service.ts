import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'


@Injectable()
export class CryptService {
  private readonly SALTROUNDS = 10;

  async getHash(passwordPlain: string) {
    return bcrypt.hash(passwordPlain, this.SALTROUNDS).then((hash) => hash);
  }

  async verifyPassword(passwordPlain: string, passwordHash) {
    return bcrypt.compare(passwordPlain, passwordHash).then((result) => result);
  }
}
