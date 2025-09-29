import { UserJwtPayload } from '../../modules/auth/interfaces/user-payload.interface';
import 'express';
declare module 'express' {
  export interface Request {
    user?: UserJwtPayload;
  }
}
