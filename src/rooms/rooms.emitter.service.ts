import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class RoomsEmitterService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  async userJoined(userJoined: User, roomId: number, userId: number) {
    const socket = this.socketService.getSocket(userId);
    if (socket) {
      socket.to(`rooms_${roomId}`).emit('rooms:joined', userJoined);
    }
  }

  async userLeft(userLeft: User, roomId: number, userId: number) {
    const socket = this.socketService.getSocket(userId);
    if (socket) {
      socket.to(`rooms_${roomId}`).emit('rooms:left', userLeft);
    }
  }
}
