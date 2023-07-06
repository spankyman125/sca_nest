import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsEmitterService } from './rooms.emitter.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsEmitterService],
  imports: [PrismaModule],
})
export class RoomsModule {}
