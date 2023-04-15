import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityNotFoundError } from 'src/shared/errors/business-errors';
import { SocketServerService } from 'src/socket/socket.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketServerService: SocketServerService,
  ) {}

  async findMany() {
    return this.prismaService.room.findMany();
  }

  async create(userId: number, createRoomDto: CreateRoomDto) {
    const roomCreated = await this.prismaService.room
      .create({
        data: {
          name: createRoomDto.name,
          users: {
            create: [{ user: { connect: { id: userId } } }],
          },
        },
      })
      .catch(() => {
        throw new Error();
      });
    return roomCreated;
  }

  async findOne(roomId: number) {
    return this.prismaService.room
      .findUniqueOrThrow({ where: { id: roomId } })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async update(roomId: number, updateRoomDto: UpdateRoomDto) {
    return this.prismaService.room
      .update({
        where: { id: roomId },
        data: updateRoomDto,
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async getMessages(roomId: number) {
    return this.prismaService.message
      .findMany({
        where: { roomId: { equals: roomId } },
        include: { user: true },
      })
      .catch(() => {
        throw new EntityNotFoundError();
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
      .catch(() => {
        throw new EntityNotFoundError();
      })
      .then((room) => room.users.map((user) => user.user));
  }

  async addUser(roomId: number, userId: number) {
    return this.prismaService.room
      .update({
        where: { id: roomId },
        data: {
          users: {
            connect: { userId_roomId: { roomId, userId } },
          },
        },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async removeUser(roomId: number, userId: number) {
    return this.prismaService.room
      .update({
        where: { id: roomId },
        data: {
          users: {
            disconnect: { userId_roomId: { roomId: roomId, userId: userId } },
          },
        },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async remove(roomId: number) {
    return this.prismaService.room
      .delete({ where: { id: roomId } })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }
}
