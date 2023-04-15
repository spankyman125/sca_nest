import { Module } from '@nestjs/common';
import { CryptModule } from 'src/crypt/crypt.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './controllers/users.controller';
import { UsersIdController } from './controllers/users-id.controller';
import { UsersMeController } from './controllers/users-me.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UsersMeController, UsersIdController],
  providers: [UsersService],
  imports: [CryptModule, PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
