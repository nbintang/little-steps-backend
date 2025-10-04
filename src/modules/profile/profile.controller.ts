import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserRole } from '../user/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { Request } from 'express';
import { VerifyEmailGuard } from '../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../auth/guards/completed-profile.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('protected/profile')
@Roles(UserRole.ADMINISTRATOR, UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get('me')
  @UseGuards()
  async getProfile(@Req() request: Request) {
    const userId = request.user.sub;
    return await this.profileService.findProfile(userId);
  }

  @Patch('me')
  async updateProfile(
    @Req() request: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = request.user.sub;
    return await this.profileService.updateProfile(userId, updateProfileDto);
  }
}
