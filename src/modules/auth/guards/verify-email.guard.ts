import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UserJwtPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class VerifyEmailGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: UserJwtPayload }>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Please Login First');
    if (!user.verified)
      throw new ForbiddenException('Please Verify Your Email First');
    return true;
  }
}
