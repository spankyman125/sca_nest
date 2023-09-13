import { Module } from '@nestjs/common';
import { MediasoupService } from './mediasoup.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [MediasoupService],
  exports: [MediasoupService],
  imports: [PrismaModule],
})
export class MediasoupModule {}
