import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    switch (ctx.getType()) {
      case 'http':
        return ctx.switchToHttp().getRequest().user;
      case 'ws':
        return ctx.switchToWs().getClient().user;
      default:
        throw new Error('Cannot get user, unknown context');
    }
  },
);

export interface UserPayload {
  username: string,
  sub: number
}