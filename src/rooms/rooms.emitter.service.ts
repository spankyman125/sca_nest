import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class RoomsEmitterService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  async roomCreated(roomId: number, initiatorId: number) {
    const initiatorSocket = this.socketService.getSocket(initiatorId);
    if (initiatorSocket) {
      initiatorSocket.join(`rooms_${roomId}`);
    }
  }

  async userJoined(userJoined: User, roomId: number, initiatorId: number) {
    const initiatorSocket = this.socketService.getSocket(initiatorId);
    const joinedUserSocket = this.socketService.getSocket(userJoined.id);
    if (initiatorSocket && joinedUserSocket) {
      //TODO: split into invite and receive invite events
      const lastMessage = {
        messages: {
          take: 1,
          orderBy: { createdAt: Prisma.SortOrder.desc },
          include: {
            attachments: true,
            user: {
              select: { avatarUrl: true, id: true, pseudonym: true },
            },
          },
        },
      };
      const roomJoined = await this.prismaService.room.findUniqueOrThrow({
        where: { id: roomId },
        include: lastMessage,
      });
      joinedUserSocket.join(`rooms_${roomId}`);
      joinedUserSocket.emit(`rooms:invite-accepted`, roomJoined);
      initiatorSocket
        .to(`rooms_${roomId}`)
        .emit('rooms:joined', { ...userJoined, roomId });
    }
  }

  async userLeft(userLeft: User, roomId: number, initiatorId: number) {
    const initiatorSocket = this.socketService.getSocket(initiatorId);
    const leftedUserSocket = this.socketService.getSocket(userLeft.id);
    if (initiatorSocket && leftedUserSocket) {
      leftedUserSocket.leave(`rooms_${roomId}`);
      initiatorSocket
        .to(`rooms_${roomId}`)
        .emit('rooms:left', { ...userLeft, roomId });
    }
  }
}
