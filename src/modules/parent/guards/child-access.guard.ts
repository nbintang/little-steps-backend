// src/auth/guards/child-access.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ParentalControlScheduleService } from '../services/parental-control-schedule.service';

@Injectable()
export class ChildAccessGuard implements CanActivate {
  constructor(
    private readonly parentalControlScheduleService: ParentalControlScheduleService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user.childId) {
      throw new ForbiddenException('Child context missing');
    }

    const allowedWindows =
      await this.parentalControlScheduleService.getCurrentAccessWindow(
        user.childId,
      );

    const isAllowedNow = allowedWindows.some((w) => w.activeNow);
    if (!isAllowedNow) {
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

    request.child = user; // inject ke request biar bisa dipake controller
    return true;
  }
}
