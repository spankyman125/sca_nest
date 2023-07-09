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
    return this.prismaService.room.findMany();
  }

  async create(userId: number, createRoomDto: CreateRoomDto) {
    const roomCreated = await this.prismaService.room.create({
      data: {
        name: createRoomDto.name,
        users: {
          create: [{ user: { connect: { id: userId } } }],
        },
      },
    });
    return roomCreated;
  }

  async findOne(roomId: number) {
    return this.prismaService.room.findUniqueOrThrow({
      where: { id: roomId },
      include: { messages: { include: { user: true } }, users: true },
    });
  }

  async update(roomId: number, updateRoomDto: UpdateRoomDto) {
    return this.prismaService.room.update({
      where: { id: roomId },
      data: updateRoomDto,
    });
  }

  async getMessages(roomId: number) {
    return this.prismaService.message.findMany({
      where: { roomId: { equals: roomId } },
      include: { user: true },
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

  async addUser(roomId: number, userId: number) {
    const updatedRoom = await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        users: {
          create: { user: { connect: { id: userId } } },
        },
      },
    });
    this.emitter.userJoined(userId, roomId);
    return updatedRoom;
  }

  async removeUser(roomId: number, userId: number) {
    const removedUser = await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        users: {
          delete: { userId_roomId: { roomId, userId } },
        },
      },
    });
    this.emitter.userLeft(userId, roomId);
    return removedUser;
  }

  async remove(roomId: number) {
    return this.prismaService.room.delete({ where: { id: roomId } });
  }
}
