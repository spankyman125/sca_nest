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
} from 'mediasoup/node/lib/types';
import { SocketService } from '../socket/socket.service';
import config from './mediasoup.config';

class MediasoupRoom {
  worker: Worker;
  producer: Producer;
  consumer: Consumer;
  producerTransport: WebRtcTransport;
  consumerTransport: WebRtcTransport;
  mediasoupRouter: Router;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  async init() {
    const mediaCodecs = config.mediasoup.routerOptions
      .mediaCodecs as RtpCodecCapability[];
    this.mediasoupRouter = await this.worker.createRouter({ mediaCodecs });
  }

  private async createWebRtcTransport() {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate } =
      config.mediasoup.webRtcTransportOptions;

    const transport = await this.mediasoupRouter.createWebRtcTransport({
      listenIps: config.mediasoup.webRtcTransportOptions.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    });
    transport.on('@close', () => console.log('transport close'));
    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) {}
    }
    return {
      transport,
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    };
  }

  async createConsumerTransport() {
    const { transport, params } = await this.createWebRtcTransport();
    this.consumerTransport = transport;
    return params;
  }

  async createProducerTransport() {
    const { transport, params } = await this.createWebRtcTransport();
    this.producerTransport = transport;
    return params;
  }

  async produce(kind: any, rtpParameters: any) {
    this.producer = await this.producerTransport.produce({
      kind,
      rtpParameters,
    });
    return { id: this.producer.id };
  }

  async consume(rtpCapabilities: any) {
    return await this.createConsumer(this.producer, rtpCapabilities);
  }

  private async createConsumer(producer, rtpCapabilities) {
    if (
      !this.mediasoupRouter.canConsume({
        producerId: producer.id,
        rtpCapabilities,
      })
    ) {
      console.error('can not consume');
      return;
    }
    try {
      this.consumer = await this.consumerTransport.consume({
        producerId: producer.id,
        rtpCapabilities,
        paused: producer.kind === 'video',
      });
    } catch (error) {
      console.error('consume failed', error);
      return;
    }

    if (this.consumer.type === 'simulcast') {
      await this.consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2,
      });
    }

    return {
      producerId: producer.id,
      id: this.consumer.id,
      kind: this.consumer.kind,
      rtpParameters: this.consumer.rtpParameters,
      type: this.consumer.type,
      producerPaused: this.consumer.producerPaused,
    };
  }

  async resume() {
    this.consumer.resume();
  }
}

@Injectable()
export class MediasoupService {
  rooms: Map<number, MediasoupRoom> = new Map();
  worker: Worker;

  constructor(private readonly socketService: SocketService) {
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
      const room = new MediasoupRoom(this.worker);
      await room.init();
      this.rooms.set(roomId, room);
      return room;
    }
  }
}
