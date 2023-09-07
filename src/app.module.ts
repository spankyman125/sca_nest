import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { AuthModule } from './auth/auth.module';
import { CryptModule } from './crypt/crypt.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { SocketModule } from './socket/socket.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { MediasoupModule } from './mediasoup/mediasoup.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    MessagesModule,
    AuthModule,
    CryptModule,
    RoomsModule,
    SocketModule,
    MediasoupModule,
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
