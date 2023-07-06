import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class RoomsEmitterService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  async userJoined(userId: number, roomId: number) {
    const socket = this.socketService.getSocket(userId);
    if (socket) {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      socket.to(`rooms_${roomId}`).emit('rooms:users:joined', user);
    }
  }

  async userLeft(userId: number, roomId: number) {
    const socket = this.socketService.getSocket(userId);
    if (socket) {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      socket.to(`rooms_${roomId}`).emit('rooms:users:left', user);
    }
  }
}
