import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsEmitterService } from './rooms.emitter.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emitter: RoomsEmitterService,
  ) {}

  async findMany() {
    return this.prismaService.room.findMany({
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { avatarUrl: true, id: true, pseudonym: true } },
          },
        },
      },
    });
  }

  async search(name?: string) {
    return this.prismaService.room.findMany({
      where: { name: { contains: name }, private: { not: { equals: true } } },
    });
  }

  async create(
    userId: number,
    createRoomDto: CreateRoomDto,
    file?: Express.Multer.File,
  ) {
    const roomCreated = await this.prismaService.room.create({
      data: {
        name: createRoomDto.name,
        ...(file ? { avatarUrl: file.path.replace('public/', '') } : {}),
        users: {
          create: [{ user: { connect: { id: userId } } }],
        },
      },
    });
    this.emitter.roomCreated(roomCreated.id, userId);
    return roomCreated;
  }

  async findOne(roomId: number) {
    return this.prismaService.room.findUniqueOrThrow({
      where: { id: roomId },
      include: {
        messages: {
          include: {
            user: { select: { avatarUrl: true, id: true, pseudonym: true } },
          },
        },
        users: true,
      },
    });
  }

  async update(roomId: number, updateRoomDto: UpdateRoomDto) {
    return this.prismaService.room.update({
      where: { id: roomId },
      data: updateRoomDto,
    });
  }

  async getMessages(roomId: number, skip = 0, take = 50) {
    return this.prismaService.message.findMany({
      where: { roomId: { equals: roomId } },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: take,
      include: {
        user: { select: { avatarUrl: true, id: true, pseudonym: true } },
      },
    });
  }

  async getUsers(roomId: number) {
    const selectUserFields = {
      avatarUrl: true,
      id: true,
      pseudonym: true,
      username: true,
    };
    return this.prismaService.room
      .findUniqueOrThrow({
        where: { id: roomId },
        include: {
          users: {
            include: { user: { select: selectUserFields } },
          },
          messages: true,
        },
      })
      .then((room) => room.users.map((user) => user.user));
  }

  async addUser(roomId: number, userToAddId: number, userId: number) {
    await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        users: {
          create: { user: { connect: { id: userToAddId } } },
        },
      },
    });
    const userAdded = await this.prismaService.user.findUniqueOrThrow({
      where: { id: userToAddId },
    });
    this.emitter.userJoined(userAdded, roomId, userId);
    return userAdded;
  }

  async removeUser(roomId: number, userToRemoveId: number, userId: number) {
    await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        users: {
          delete: { userId_roomId: { roomId, userId: userToRemoveId } },
        },
      },
    });
    const removedUser = await this.prismaService.user.findUniqueOrThrow({
      where: { id: userToRemoveId },
    });
    this.emitter.userLeft(removedUser, roomId, userId);
    return removedUser;
  }

  async remove(roomId: number) {
    return this.prismaService.room.delete({ where: { id: roomId } });
  }
}
