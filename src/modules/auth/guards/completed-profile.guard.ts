import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class CompletedProfileGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isUserRegistered = request.user?.is_registered;

    if (!isUserRegistered) {
      throw new ForbiddenException('Please complete your profile first');
    }

    return true;
  }
}
