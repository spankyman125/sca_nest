import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CryptModule } from 'src/crypt/crypt.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtSecret } from './secret';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UsersModule,
    PrismaModule,
    CryptModule,
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '3000s' },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
