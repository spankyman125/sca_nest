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
    console.log(`User ${socket.id} disconnected`);
  }

  // @SubscribeMessage('mediasoup:connect')
  // async mediasoupConnect(@MessageBody() data: any) {
  //   const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
  //   return mediasoupRoom.mediasoupRouter.rtpCapabilities;
  // }

  // @SubscribeMessage('mediasoup:publish')
  // async mediasoupPublish(@MessageBody() data: any) {
  //   const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
  //   try {
  //     const { transport, params } = await mediasoupRoom.createWebRtcTransport();
  //     this.mediasoupService.producerTransport = transport;
  //     return params;
  //   } catch (err) {
  //     console.error(err);
  //     return { error: err.message };
  //   }
  // }

  @SubscribeMessage('getRouterRtpCapabilities')
  async getRouterRtpCapabilities(@MessageBody() data: any) {
    console.log('getRouterRtpCapabilities');
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    return mediasoupRoom.mediasoupRouter.rtpCapabilities;
  }

  @SubscribeMessage('createProducerTransport')
  async createProducerTransport(@MessageBody() data: any) {
    console.log(`createProducerTransport (${data.roomId})`);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    try {
      return await mediasoupRoom.createProducerTransport();
    } catch (err) {
      return { error: err.message };
    }
  }

  @SubscribeMessage('createConsumerTransport')
  async createConsumerTransport(@MessageBody() data: any) {
    console.log(`createConsumerTransport (${data.roomId})`);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    try {
      return await mediasoupRoom.createConsumerTransport();
    } catch (err) {
      return { error: err.message };
    }
  }

  @SubscribeMessage('connectProducerTransport')
  async connectProducerTransport(@MessageBody() data: any) {
    console.log('connectProducerTransport', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    await mediasoupRoom.producerTransport.connect({
      dtlsParameters: data.dtlsParameters,
    });
    console.log('connectProducerTransport connected');
    return true;
  }

  @SubscribeMessage('connectConsumerTransport')
  async connectConsumerTransport(@MessageBody() data: any) {
    console.log('connectConsumerTransport', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    await mediasoupRoom.consumerTransport.connect({
      dtlsParameters: data.dtlsParameters,
    });
    console.log('connectConsumerTransport connected');
    return true;
  }

  @SubscribeMessage('produce')
  async produce(@MessageBody() data: any) {
    console.log('produce, ', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    const { kind, rtpParameters } = data;
    return mediasoupRoom.produce(kind, rtpParameters);
  }

  @SubscribeMessage('consume')
  async consume(@MessageBody() data: any) {
    console.log('consume', data);
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    return mediasoupRoom.consume(data.rtpCapabilities);
  }

  @SubscribeMessage('resume')
  async resume(@MessageBody() data: any) {
    console.log('resume');
    const mediasoupRoom = await this.mediasoupService.ensureRoom(data.roomId);
    await mediasoupRoom.resume();
    return true;
  }
}
