import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { QueryProgressDto } from './dto/progress-quiz.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CompletedProfileGuard } from '../auth/guards/completed-profile.guard';
import { VerifyEmailGuard } from '../auth/guards/verify-email.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('protected/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProgress(@Query() query: QueryProgressDto) {
    return this.progressService.getAllProgress(query);
  }
}
