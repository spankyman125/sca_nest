import { Injectable } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
import {
  WorkerLogLevel,
  WorkerLogTag,
  Producer,
  Consumer,
  WebRtcTransport,
  Worker,
  Router,
  RtpCodecCapability,
  IceCandidate,
  DtlsParameters,
  IceParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
} from 'mediasoup/node/lib/types';
import { SocketService } from '../socket/socket.service';
import config from './mediasoup.config';
import { AuthSocket } from '../app.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { lookup } from 'dns';
import { promisify } from 'util';

export interface TransportOptions {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface Peer {
  socket: AuthSocket;
  user: User;
  transport: { consumer: WebRtcTransport; producer: WebRtcTransport };
  producer: Producer | undefined;
  consumers: Consumer[];
}

class MediasoupRoom {
  worker: Worker;
  prismaService: PrismaService;

  mediasoupRouter: Router;
  peers: Map<string, Peer> = new Map();

  constructor(worker: Worker, prismaService: PrismaService) {
    this.worker = worker;
    this.prismaService = prismaService;
  }

  async init() {
    const mediaCodecs = config.mediasoup.routerOptions
      .mediaCodecs as RtpCodecCapability[];
    this.mediasoupRouter = await this.worker.createRouter({ mediaCodecs });
  }

  removePeer(socket: AuthSocket) {
    const peerToRemove = this.peers.get(socket.id);
    peerToRemove?.transport.consumer.close();
    peerToRemove?.transport.producer.close();
    this.peers.delete(socket.id);
  }

  async join(socket: AuthSocket): Promise<{
    consumerTransportOptions: TransportOptions;
    producerTransportOptions: TransportOptions;
    producerIds: string[];
  }> {
    const consumerTransport = await this.createWebRtcTransport();
    const producerTransport = await this.createWebRtcTransport();
    this.peers.set(socket.id, {
      socket: socket,
      user: await this.prismaService.user.findUniqueOrThrow({
        where: { id: socket.user.sub },
      }),
      transport: {
        consumer: consumerTransport.transport,
        producer: producerTransport.transport,
      },
      producer: undefined,
      consumers: [],
    });
    const producerIds: string[] = [];
    this.peers.forEach((peer) => {
      if (peer.producer) producerIds.push(peer.producer.id);
    });
    return {
      consumerTransportOptions: consumerTransport.options, //strip to TransportOptions
      producerTransportOptions: producerTransport.options,
      producerIds,
    };
  }

  private async createWebRtcTransport() {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate } =
      config.mediasoup.webRtcTransportOptions;
    const listenIps = config.mediasoup.webRtcTransportOptions.listenIps;
    const promisifiedDns = promisify(lookup);
    let announcedIp = '';
    if (listenIps[0].hostname) {
      announcedIp = (await promisifiedDns(listenIps[0].hostname)).address;
    } else if (listenIps[0].announcedIp) {
      announcedIp = listenIps[0].announcedIp;
    } else {
      announcedIp = '127.0.0.1';
    }
    console.log('Mediasoup announced ip is ', announcedIp);
    listenIps[0].announcedIp = announcedIp;
    const transport = await this.mediasoupRouter.createWebRtcTransport({
      listenIps: config.mediasoup.webRtcTransportOptions.listenIps,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    });
    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) { }
    }
    const options: TransportOptions = {
      id: transport.id,
      dtlsParameters: transport.dtlsParameters,
      iceCandidates: transport.iceCandidates,
      iceParameters: transport.iceParameters,
    };
    return { transport, options };
  }

  async connectProducerTransport(
    socket: AuthSocket,
    dtlsParameters: DtlsParameters,
  ) {
    const peer = this.peers.get(socket.id);
    peer?.transport.producer.connect({ dtlsParameters });
  }

  async connectConsumerTransport(
    socket: AuthSocket,
    dtlsParameters: DtlsParameters,
  ) {
    const peer = this.peers.get(socket.id);
    peer?.transport.consumer.connect({ dtlsParameters });
  }

  async produce(
    socket: AuthSocket,
    kind: MediaKind,
    rtpParameters: RtpParameters,
  ) {
    const peer = this.peers.get(socket.id);
    if (peer) {
      const producer = await peer?.transport.producer.produce({
        kind,
        rtpParameters,
      });
      peer.producer = producer;
      producer.on('transportclose', () => {
        this.peers.forEach((peer) =>
          peer.socket.emit('mediasoup:producer:close', producer.id),
        );
      });
      this.notifyPeers(socket, peer.producer.id);
      return { id: peer?.producer?.id };
    }
  }

  async notifyPeers(socket: AuthSocket, producerId: string) {
    this.peers.forEach((peer) => {
      if (peer.socket.id !== socket.id)
        peer.socket.emit('mediasoup:producer:new', producerId); //strip to TransportOptions
    });
  }

  async consume(
    socket: AuthSocket,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
  ) {
    // if (
    //   !this.mediasoupRouter.canConsume({
    //     producerId,
    //     rtpCapabilities,
    //   })
    // ) {
    //   console.error('can not consume');
    //   return;
    // }
    try {
      const peer = this.peers.get(socket.id);
      if (peer) {
        const consumer = await peer.transport.consumer.consume({
          producerId,
          rtpCapabilities,
          paused: true,
          // paused: producer.object.kind === 'video',
        });
        consumer.on('transportclose', () => {
          this.peers.forEach((peer) =>
            peer.socket.emit('mediasoup:consumer:close', { id: consumer.id }),
          );
        });
        peer.consumers.push(consumer);
        let producerUser: User;
        this.peers.forEach((peer) => {
          if (peer.producer?.id === producerId) producerUser = peer.user;
        });
        return {
          id: consumer.id,
          user: producerUser!,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          type: consumer.type,
          producerPaused: consumer.producerPaused,
        };
      }
    } catch (error) {
      console.error('consume failed', error);
      return;
    }
  }

  async resume(socket: AuthSocket, consumerId: string) {
    const peer = this.peers.get(socket.id);
    peer?.consumers.find((consumer) => consumer.id === consumerId)?.resume();
  }
}

@Injectable()
export class MediasoupService {
  rooms: Map<number, MediasoupRoom> = new Map();
  worker: Worker;

  constructor(
    private readonly socketService: SocketService,
    private readonly prismaService: PrismaService,
  ) {
    this.runMediasoupWorker();
  }

  async runMediasoupWorker() {
    this.worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.workerSettings.logLevel as WorkerLogLevel,
      logTags: config.mediasoup.workerSettings.logTags as WorkerLogTag[],
      rtcMinPort: Number(config.mediasoup.workerSettings.rtcMinPort),
      rtcMaxPort: Number(config.mediasoup.workerSettings.rtcMaxPort),
    });
    this.worker.on('died', () => {
      console.error(
        'mediasoup worker died, exiting in 2 seconds... [pid:%d]',
        this.worker.pid,
      );
      setTimeout(() => process.exit(1), 2000);
    });
  }

  async ensureRoom(roomId: number): Promise<MediasoupRoom> {
    if (this.rooms.has(roomId)) return this.rooms.get(roomId)!;
    else {
      const room = new MediasoupRoom(this.worker, this.prismaService);
      await room.init();
      this.rooms.set(roomId, room);
      return room;
    }
  }
}
