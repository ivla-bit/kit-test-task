import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/auth-request.type';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';

export const User = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return data ? request.user?.[data] : request.user;
  },
);
