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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend'),
      exclude: [ '/static/(.*)' ]
    }),
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
