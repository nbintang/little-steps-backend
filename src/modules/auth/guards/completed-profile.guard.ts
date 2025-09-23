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
export class CompletedProfileGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: UserJwtPayload }>();
    const isUserRegistered = request.user?.is_registered;

    if (!isUserRegistered) {
      throw new ForbiddenException('Please complete your profile first');
    }

    return true;
  }
}
