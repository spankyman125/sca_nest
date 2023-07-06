import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CryptService } from 'src/crypt/crypt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityNotFoundError,
  UnprocessableEntityError,
  UsernameExists,
} from 'src/shared/errors/business-errors';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersEmitterService } from './user.emitter.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly cryptService: CryptService,
    private readonly prismaService: PrismaService,
    private readonly emitter: UsersEmitterService,
  ) {}

  async findMany() {
    return this.prismaService.user.findMany();
  }

  async create({ username, pseudonym, password }: CreateUserDto) {
    const hash = await this.cryptService.getHash(password);
    const newUser = {
      username: username,
      pseudonym: pseudonym,
      passwordHash: hash,
    };
    return this.prismaService.user
      .create({
        data: newUser,
      })
      .catch(() => {
        throw new UsernameExists();
      });
  }

  async update(userId: number, { pseudonym }: UpdateUserDto) {
    const updatedUser = await this.prismaService.user
      .update({
        where: { id: userId },
        data: { pseudonym },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
    this.emitter.userUpdated(userId, updatedUser);
    return updatedUser;
  }

  async getRooms(userId: number) {
    return this.prismaService.user
      .findUniqueOrThrow({
        where: { id: userId },
        include: {
          rooms: { include: { room: { select: { name: true, id: true } } } },
        },
      })
      .then((user) => user.rooms.map((room) => room.room))
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async getMessages(userId: number) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { id: userId },
      include: { messages: true },
    });
  }

  async getFriends(userId: number) {
    const selectFriendFields = {
      avatarUrl: true,
      id: true,
      username: true,
      pseudonym: true,
    };
    return this.prismaService.user
      .findUniqueOrThrow({
        where: { id: userId },
        include: {
          friendWith: {
            include: { Friend: { select: selectFriendFields } },
          },
          friendTo: {
            include: { Friend: { select: selectFriendFields } },
          },
        },
      })
      .then((user) => {
        return [
          ...user.friendTo.map((friend) => friend.Friend),
          ...user.friendWith.map((friend) => friend.Friend),
        ];
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async addToRoom(userId: number, roomId: number) {
    return this.prismaService.userRoomRelation
      .create({
        data: { userId, roomId },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002') throw new UnprocessableEntityError();
          if (e.code === 'P2003') throw new EntityNotFoundError();
        }
        throw e;
      });
  }

  async leaveRoom(userId: number, roomId: number) {
    return this.prismaService.userRoomRelation
      .delete({
        where: { userId_roomId: { roomId, userId } },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2025') throw new EntityNotFoundError();
        }
        throw e;
      });
  }

  async findOneById(id: number) {
    return this.prismaService.user
      .findUniqueOrThrow({ where: { id: id } })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async findOneByUsername(username: string) {
    return this.prismaService.user
      .findUnique({ where: { username: username } })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async remove(id: number) {
    return this.prismaService.user.delete({ where: { id: id } }).catch(() => {
      throw new EntityNotFoundError();
    });
  }

  async addFriend(userId: number, friendId: number) {
    if (userId === friendId) throw new UnprocessableEntityError();
    let [smallerId, biggerId] = [userId, friendId];
    if (userId >= friendId) [smallerId, biggerId] = [friendId, userId];
    const newFriendRelation = await this.prismaService.friendsRelation
      .create({
        data: { userId: smallerId, friendId: biggerId },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002') throw new UnprocessableEntityError();
          if (e.code === 'P2003') throw new EntityNotFoundError();
        }
        throw e;
      });
    const newPrivateRoom = await this.prismaService.room.create({
      data: {
        private: true,
        name: 'Private room',
        users: {
          create: [
            { user: { connect: { id: smallerId } } },
            { user: { connect: { id: biggerId } } },
          ],
        },
      },
    });
    return newFriendRelation;
  }

  async removeFriend(id: number, friendId: number) {
    return this.prismaService.friendsRelation
      .delete({
        where: { userId_friendId: { friendId: friendId, userId: id } },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }
}
