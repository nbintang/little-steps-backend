import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { QueryStatisticQuizDto } from './dto/statistic-quiz.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CompletedProfileGuard } from '../auth/guards/completed-profile.guard';
import { VerifyEmailGuard } from '../auth/guards/verify-email.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('protected/statistics')
export class StatisticController {
  constructor(private readonly progressService: StatisticService) {}
  @Get('quizzes')
  @HttpCode(HttpStatus.OK)
  async getAllQuizProgress(@Query() query: QueryStatisticQuizDto) {
    return this.progressService.getAllQuizProgress(query);
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUserProgress(@Query() query: QueryStatisticQuizDto) {
    return this.progressService.getAllUserProgress(query);
  }
}
