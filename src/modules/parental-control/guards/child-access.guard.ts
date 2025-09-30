// src/auth/guards/child-access.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ParentalControlService } from '../parental-control.service';
import { ChildPayload } from '../interfaces/child-payload.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ChildAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly parentalService: ParentalControlService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const token = request.cookies?.['childToken'] || null;
    if (!token) throw new UnauthorizedException('Child token missing');

    let payload: ChildPayload;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (err) {
      this.logger.log(err);
      throw new UnauthorizedException('Invalid or expired child token');
    }
    if (!payload?.childId || !payload?.parentId) {
      throw new ForbiddenException('Invalid child token payload');
    }
    const allowedWindows = await this.parentalService.getCurrentAccessWindow(
      payload.childId,
    );

    const isAllowedNow = allowedWindows.some((w) => w.activeNow);

    if (!isAllowedNow) {
      this.logger.log(allowedWindows);
      const allowedStr = allowedWindows
        .map((w) => {
          const start = w.startTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          const end = w.endTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          return `${start} - ${end} (${w.timezone})`;
        })
        .join(', ');

      throw new ForbiddenException(
        `Access restricted by parental control schedule. Allowed access: [${allowedStr}]`,
      );
    }
    request.child = { id: payload.childId, parentId: payload.parentId };
    return true;
  }
}
