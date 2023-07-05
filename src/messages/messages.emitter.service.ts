import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class MessagesEmitterService {
  constructor(private readonly socketService: SocketService) {}

  async messageNew(userId: number, roomId: number, message) {
    const socket = this.socketService.getSocket(userId);
    if (socket) socket.to(`rooms_${roomId}`).emit('messages:new', message);
  }

  async messageEdit(userId: number, message: Message) {
    const socket = this.socketService.getSocket(userId);
    if (socket)
      socket.to(`rooms_${message.roomId}`).emit('messages:edited', message);
  }
}
