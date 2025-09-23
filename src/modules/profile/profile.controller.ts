import { Controller, Get, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserRole } from '../user/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { Request } from 'express';
import { VerifyEmailGuard } from '../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../auth/guards/completed-profile.guard';

@Controller('profile')
@UseGuards(AccessTokenGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get('me')
  @Roles(UserRole.ADMINISTRATOR, UserRole.PARENT)
  @UseGuards(RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
  async getProfile(@Req() request: Request) {
    const userId = request.user.sub;
    return await this.profileService.findProfile(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
