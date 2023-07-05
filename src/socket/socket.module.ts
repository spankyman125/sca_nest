import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  controllers: [],
  providers: [SocketService],
  imports: [PrismaModule],
  exports: [SocketService],
})
export class SocketModule {}
