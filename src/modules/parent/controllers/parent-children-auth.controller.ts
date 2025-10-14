import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { ParentChildrenAuthService } from '../services/parent-children-auth.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { ParentalControlScheduleService } from '../services/parental-control-schedule.service';

@Controller('protected/parent/children/:childId/auth')
export class ParentChildrenAuthController {
  constructor(
    private readonly parentChildrenAuthService: ParentChildrenAuthService,
    private readonly parentalControlScheduleService: ParentalControlScheduleService,
  ) {}
  private isDevelopment = process.env.NODE_ENV === 'development';
  private getCookieOptions(): CookieOptions {
    return {
      path: '/',
      sameSite: this.isDevelopment ? 'lax' : 'none',
      secure: !this.isDevelopment,
      httpOnly: true,
    };
  }
  @Roles(UserRole.PARENT)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Post('access')
  @HttpCode(HttpStatus.OK)
  async accessChild(
    @Param('childId') childId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const parentId = request.user.sub;
    const token = await this.parentChildrenAuthService.signChildToken(
      parentId,
      childId,
    );
    response.cookie('childToken', token, this.getCookieOptions());

    return {
      message: 'Success',
      data: {
        accessInfo: {
          isAllowed: true,
          isActive: true,
        },
      },
    };
  }

  @Delete('exit')
  async exitChild(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('childToken', this.getCookieOptions());
    return { message: 'Exit success' };
  }
}
