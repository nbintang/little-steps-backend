import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { RateQuizDto } from '../dto/quiz/rate-quiz.dto';
import { QuizService } from '../services/quiz.service';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';

@Controller('quizzes')
export class PublicQuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(AccessTokenGuard, VerifyEmailGuard, CompletedProfileGuard)
  @Patch(':quizId/rates')
  async rate(
    @Param('quizId') quizId: string,
    @Body() rateQuizDto: RateQuizDto,
  ) {
    return await this.quizService.rateQuiz(rateQuizDto, quizId);
  }
}
