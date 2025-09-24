import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthProvider } from '../enums/auth-provider.enum';
import { UserService } from '../../user/user.service';
import { Request } from 'express';
import { PROVIDER_KEY } from '../decorators/provider.decorator';

@Injectable()
export class ProviderGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const provider = this.reflector.getAllAndOverride<AuthProvider>(
      PROVIDER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!provider) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const { email } = request.body;
    if (!email) throw new UnauthorizedException('Email is required');

    const user = await this.userService.findUserByEmail(email);

    if (user && user.provider !== provider) {
      throw new UnauthorizedException(
        `Account already used with different provider`,
      );
    }

    return true;
  }
}
