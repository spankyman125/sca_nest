import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { MediasoupService } from './mediasoup/mediasoup.service';
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
    private mediasoupService: MediasoupService,
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
    this.mediasoupService.rooms.forEach((room) => room.removePeer(socket));
    console.log(`User ${socket.id} disconnected`);
  }

  @SubscribeMessage('mediasoup:join')
  async join(@MessageBody() data: any, @ConnectedSocket() socket: AuthSocket) {
    console.log('mediasoup:join');
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    return await mediasoupRoom.join(socket);
  }

  @SubscribeMessage('mediasoup:getRTPCaps')
  async getRouterRtpCapabilities(@MessageBody() data: any) {
    console.log('mediasoup:getRTPCaps');
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    return mediasoupRoom.mediasoupRouter.rtpCapabilities;
  }

  @SubscribeMessage('mediasoup:connect:producer')
  async connectProducerTransport(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    console.log('mediasoup:connect:producer', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    await mediasoupRoom.connectProducerTransport(socket, data.dtlsParameters);
    console.log('mediasoup:connect:producer connected');
    return true;
  }

  @SubscribeMessage('mediasoup:connect:consumer')
  async connectConsumerTransport(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    console.log('mediasoup:connect:consumer', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    await mediasoupRoom.connectConsumerTransport(socket, data.dtlsParameters);
    console.log('mediasoup:connect:consumer connected');
    return true;
  }

  @SubscribeMessage('produce')
  async produce(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    console.log('produce, ', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    return mediasoupRoom.produce(socket, data.kind, data.rtpParameters);
  }

  @SubscribeMessage('consume')
  async consume(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    console.log('consume', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    return await mediasoupRoom.consume(
      socket,
      data.producerId,
      data.rtpCapabilities,
    );
  }

  @SubscribeMessage('resume')
  async resume(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    console.log('resume');
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    await mediasoupRoom.resume(socket, data.consumerId);
    return true;
  }
}
