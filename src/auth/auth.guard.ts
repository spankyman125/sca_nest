import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from './secret';
import { WsException } from '@nestjs/websockets';

@Injectable()
abstract class AbstractGuard implements CanActivate {
  protected authException;
  constructor(protected jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(context);
    if (!token) {
      throw new this.authException('Auth token not provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      request['user'] = payload;
    } catch {
      throw new this.authException('Bad auth token');
    }
    return true;
  }

  abstract extractToken(context: ExecutionContext): string | undefined;
}

export class WsGuard extends AbstractGuard {
  constructor(args) {
    super(args);
    super.authException = WsException;
  }

  extractToken(context): string | undefined {
    const [type, token] =
      context
        .switchToWs()
        .getClient()
        .handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

export class HttpGuard extends AbstractGuard {
  constructor(args) {
    super(args);
    super.authException = UnauthorizedException;
  }
  extractToken(context): string | undefined {
    const [type, token] =
      context.switchToHttp().getRequest().headers.authorization?.split(' ') ??
      [];
    return type === 'Bearer' ? token : undefined;
  }
}
