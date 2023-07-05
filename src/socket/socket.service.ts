import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthSocket } from 'src/app.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocketService {
  public server: Server;
  private idSocketMap = new Map<number, AuthSocket>();

  constructor(private prismaService: PrismaService) {}

  mapIdToSocket(userId: number, socket: AuthSocket) {
    this.idSocketMap.set(userId, socket);
  }

  unmapIdFromSocket(userId: number) {
    this.idSocketMap.delete(userId);
  }

  getSocket(userId: number): undefined | AuthSocket {
    return this.idSocketMap.get(userId);
  }

  async joinSocketRooms(userId: number, client: AuthSocket) {
    const roomsToJoin: string[] = [`friends_${userId}`];
    const friendsRelations = await this.prismaService.friendsRelation.findMany({
      where: { userId: userId },
    });
    friendsRelations.forEach(({ friendId }) =>
      roomsToJoin.push(`friends_${friendId}`),
    );
    const roomsRelations = await this.prismaService.userRoomRelation.findMany({
      where: { userId: userId },
    });
    roomsRelations.forEach(({ roomId }) => roomsToJoin.push(`rooms_${roomId}`));
    client.join(roomsToJoin);
  }
}
