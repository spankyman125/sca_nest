import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { CryptService } from './crypt/crypt.service';
import { CryptModule } from './crypt/crypt.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    MessagesModule,
    AuthModule,
    CryptModule,
    RoomsModule
  ],
  controllers: [AppController],
  providers: [AppService, CryptService],
})
export class AppModule {}
