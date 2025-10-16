import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query, // Import Query decorator
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChildAccessGuard } from '../../parent/guards/child-access.guard';
import { Request } from 'express';
import { QueryQuizPlayDto } from '../../quiz/dto/quiz/query-quiz-play.dto';
import { QuizService } from '../../../modules/quiz/services/quiz.service';
import { QuizPlayService } from '../../../modules/quiz/services/quiz-play.service';
import { StatisticService } from '../../../modules/statistics/statistic.service';

@UseGuards(ChildAccessGuard)
@Controller('protected/children/quizzes')
export class ChildrenQuizController {
  constructor(
    private readonly quizPlayService: QuizPlayService,
    private readonly quizService: QuizService,
    private readonly progressService: StatisticService,
  ) {}

  @Get()
  async findAllQuizzes(
    @Query() query: QueryQuizPlayDto,
    @Req() request: Request,
  ) {
    const childId = request.child.childId;
    return this.quizPlayService.findAllQuizzes(query, childId);
  }
  @Post(':quizId/start')
  async startQuiz(@Param('quizId') quizId: string, @Req() request: Request) {
    const childId = request.child.childId;
    return this.quizPlayService.startQuiz(childId, quizId);
  }

  @Get(':quizId/questions')
  async getQuizForPlay(
    @Param('quizId') quizId: string,
    @Query() query: QueryQuizPlayDto,
  ) {
    return this.quizPlayService.getQuizForPlay(quizId, query);
  }
  @Post(':quizId/submit')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Req() request: Request,
    @Body() dto: { answers: { questionId: string; answerId: string }[] },
  ) {
    const childId = request.child.childId;
    return this.quizPlayService.submitQuiz({
      childId,
      quizId,
      answers: dto.answers,
    });
  }
}
