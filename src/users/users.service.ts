import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CryptService } from 'src/crypt/crypt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnprocessableEntity } from 'src/shared/errors/business-errors';
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

  async search(username?: string, pseudonym?: string) {
    return this.prismaService.user.findMany({
      where: {
        OR: [
          { username: { contains: username } },
          { pseudonym: { contains: pseudonym } },
        ],
      },
    });
  }

  async create({ username, pseudonym, password }: CreateUserDto) {
    const hash = await this.cryptService.getHash(password);
    const newUser = {
      username: username,
      pseudonym: pseudonym,
      passwordHash: hash,
    };
    return this.prismaService.user.create({
      data: newUser,
    });
  }

  async update(userId: number, { pseudonym }: UpdateUserDto) {
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { pseudonym },
    });
    this.emitter.userUpdated(userId, updatedUser);
    return updatedUser;
  }

  async getRooms(userId: number) {
    const lastMessage = {
      messages: {
        take: 1,
        orderBy: { createdAt: Prisma.SortOrder.desc },
        include: {
          user: {
            select: { avatarUrl: true, id: true, pseudonym: true },
          },
        },
      },
    };
    return this.prismaService.user
      .findUniqueOrThrow({
        where: { id: userId },
        include: {
          rooms: {
            include: {
              room: {
                include: lastMessage,
              },
            },
          },
        },
      })
      .then((user) => user.rooms.map((room) => room.room));
  }

  async getMessages(userId: number) {
    return this.prismaService.message.findMany({
      where: { userId: userId },
    });
  }

  async getFriends(userId: number) {
    const selectFriendFields = {
      avatarUrl: true,
      id: true,
      username: true,
      pseudonym: true,
      isOnline: true,
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
      });
  }

  async addToRoom(userId: number, roomId: number) {
    return this.prismaService.userRoomRelation.create({
      data: { userId, roomId },
    });
  }

  async leaveRoom(userId: number, roomId: number) {
    return this.prismaService.userRoomRelation
      .delete({
        include: { room: true },
        where: { userId_roomId: { roomId, userId } },
      })
      .then((relation) => relation.room);
  }

  async findOneById(id: number) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { id: id },
      select: {
        id: true,
        avatarUrl: true,
        isOnline: true,
        pseudonym: true,
        username: true,
      },
    });
  }

  async findOneByUsername(username: string) {
    return this.prismaService.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        avatarUrl: true,
        isOnline: true,
        pseudonym: true,
        username: true,
      },
    });
  }

  async remove(id: number) {
    return this.prismaService.user.delete({ where: { id: id } });
  }

  async addFriend(userId: number, friendId: number) {
    const selectFriendFields = {
      avatarUrl: true,
      id: true,
      username: true,
      pseudonym: true,
    };
    if (userId === friendId) throw new UnprocessableEntity();
    const [smallerId, biggerId] = [
      Math.min(userId, friendId),
      Math.max(userId, friendId),
    ];
    const newFriendRelation = await this.prismaService.friendsRelation.create({
      data: { userId: smallerId, friendId: biggerId },
      include: { Friend: { select: selectFriendFields } },
    });

    await this.prismaService.room.create({
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
    return newFriendRelation.Friend;
  }

  async removeFriend(userId: number, friendId: number) {
    const selectFriendFields = {
      avatarUrl: true,
      id: true,
      username: true,
      pseudonym: true,
    };
    return this.prismaService.friendsRelation
      .delete({
        where: {
          userId_friendId: {
            userId: Math.min(userId, friendId),
            friendId: Math.max(userId, friendId),
          },
        },
        include: { Friend: { select: selectFriendFields } },
      })
      .then((relation) => relation.Friend);
  }
}
