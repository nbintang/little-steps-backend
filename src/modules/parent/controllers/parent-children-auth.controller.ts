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

@Controller('parent/children/:childId/auth')
export class ParentChildrenAuthController {
  constructor(
    private readonly parentChildrenAuthService: ParentChildrenAuthService,
  ) {}
  private setCookieOptions(isProduction: boolean): CookieOptions {
    return {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
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
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('childToken', token, this.setCookieOptions(isProduction));
    return { message: 'Success', data: { token } };
  }

  @Delete('exit')
  async exitChild(@Res({ passthrough: true }) response: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    response.clearCookie('childToken', this.setCookieOptions(isProduction));
    return { message: 'Exit success' };
  }
}
