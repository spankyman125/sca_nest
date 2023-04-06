import { Injectable } from '@nestjs/common';
import { CryptService } from 'src/crypt/crypt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly cryptService: CryptService,
    private readonly prismaService: PrismaService
  ) { }

  async create(createUserDto: CreateUserDto) {
    const hash = await this.cryptService.getHash(createUserDto.password);
    const newUser = {
      username: createUserDto.username,
      pseudonym: createUserDto.pseudonym,
      passwordHash: hash,
    }
    return this.prismaService.user.create({
      data: newUser,
    });
  }

  // findAll() {
  //   return this.prisma.user.findMany();
  // }

  findOneById(id: number) {
    return this.prismaService.user.findUnique({ where: { id: id } });
  }

  findOneByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username: username } });
  }

  changePseudonym(id: number, username: string) {
    return this.prismaService.user.update({
      where: { id: id },
      data: { username: username }
    });
  }

  addFriend(id: number) {
    return "This will add friend";
    // return this.prisma.user.update({
    //   where: {id},
    //   data: {}
    // });
  }

  removeFriend(id: number) {
    return "This will remove friend";
    // return this.prisma.user.update({
    //   where: {id},
    //   data: {}
    // });
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
