import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Request } from 'express';
export interface AuthRequest extends Request {
  user: JwtPayload;
}
