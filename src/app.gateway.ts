import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { SocketService } from './socket/socket.service';
import { UserPayload } from './users/user.decorator';

export interface AuthSocket extends Socket {
  user: UserPayload;
}

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
  ) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: Server) {
    this.socketService.server = server;
  }

  async handleConnection(@ConnectedSocket() socket: AuthSocket) {
    console.log(`User ${socket.id} connected`);
    //Warning: Client remains connected until token verified
    const token = this.authService.extractToken(socket.handshake.headers);
    let payload: UserPayload;
    try {
      payload = await this.authService.verifyToken(token);
    } catch (e) {
      console.log(e.message);
      socket.disconnect();
      return;
    }
    socket.user = payload;
    this.socketService.mapIdToSocket(payload.sub, socket);
    this.socketService.joinSocketRooms(payload.sub, socket);
  }

  async handleDisconnect(@ConnectedSocket() socket: AuthSocket) {
    if (socket.user) this.socketService.unmapIdFromSocket(socket.user.sub);
    console.log(`User ${socket.id} disconnected`);
  }
}
