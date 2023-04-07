import { Injectable } from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const notFound = (exception) => {
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    if (exception.code === 'P2025') return undefined;
  };
  throw exception;
}

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(userId: number, roomName: string) {
    const roomCreated = await this.prismaService.room.create({
      data: { name: roomName, }
    });
    await this.join(userId, roomCreated.id);
    return roomCreated;
  }

  async join(userId: number, roomId: number) {
    return this.prismaService.room.update({
      where: { id: roomId },
      data: {
        users: {
          connectOrCreate: {
            where: { userId_roomId: { roomId: roomId, userId: userId } },
            create: { User: { connect: { id: userId } } }
          }
        }
      }
    })
      .catch(notFound)
  }

  async leave(userId: number, roomId: number){
    const requestedRoom = await this.prismaService.room.findUnique({ where: { id: roomId } })
    if (requestedRoom === null) return undefined;
    return this.prismaService.userRoomRelation.delete({
      where: { userId_roomId: { userId: userId, roomId: roomId } },
    })
      .catch(() => null)
  }

  async findOne(roomId: number) {
    return this.prismaService.room.findUniqueOrThrow({ where: { id: roomId } })
      .catch(() => undefined);
  }

  async getMessages(roomId: number) {
    return this.prismaService.room.findUniqueOrThrow({
      where: { id: roomId },
      include: { messages: true }
    })
      .then((room) => room.messages)
      .catch(() => null);
  }

  async delete(roomId: number): Promise<Room> | null {
    return this.prismaService.room.delete({ where: { id: roomId } })
      .catch(() => null);
  }

}
