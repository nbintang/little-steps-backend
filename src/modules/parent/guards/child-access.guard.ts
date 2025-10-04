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
import { Request } from 'express';
import { ParentChildrenAuthService } from '../services/parent-children-auth.service';
import { ParentalControlException } from '../exceptions/parental-control.exception';

@Injectable()
export class ChildAccessGuard implements CanActivate {
  constructor(
    private readonly parentalControlScheduleService: ParentalControlScheduleService,
    private readonly parentChildrenAuthService: ParentChildrenAuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = request.cookies['childToken'];
    if (!token) throw new ForbiddenException('Please access child first');
    const child = await this.parentChildrenAuthService.getChildFromToken(token);
    if (!child?.childId) throw new ForbiddenException('Child context missing');
    const allowedWindows =
      await this.parentalControlScheduleService.getCurrentAccessWindow(
        child.childId,
      );
    const isAllowedNow = allowedWindows.some((w) => w.activeNow);
    if (!isAllowedNow) throw new ParentalControlException(allowedWindows);
    request.child = child;
    return true;
  }
}
