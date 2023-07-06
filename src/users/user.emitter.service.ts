import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class UsersEmitterService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  async userUpdated(userId: number, updatedUser: User) {
    const socket = this.socketService.getSocket(userId);
    if (socket) {
      const roomsRelations = await this.prismaService.userRoomRelation.findMany(
        {
          where: { userId: userId },
        },
      );
      roomsRelations.forEach(({ roomId }) =>
        socket.to(`rooms_${roomId}`).emit('rooms:users:joined', updatedUser),
      );
      socket.to(`friends_${userId}`).emit('rooms:users:joined', updatedUser);
    }
  }
}
