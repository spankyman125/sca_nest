import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesEmitterService } from './messages.emitter.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, MessagesEmitterService],
  imports: [PrismaModule],
})
export class MessagesModule {}
