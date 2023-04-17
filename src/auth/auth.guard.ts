import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Injectable()
export class HttpGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.authService.extractToken(request.headers);
    const payload = await this.authService.verifyToken(token);
    request.user = payload;
    return true;
  }
}

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.authService.extractToken(client.handshake.headers);
    const payload = await this.authService.verifyToken(token);
    client.user = payload;
    return true;
  }
}
