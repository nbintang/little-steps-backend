// src/controllers/children-quiz.controller.ts
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
import { ChildAccessGuard } from 'src/modules/parent/guards/child-access.guard';
import { Request } from 'express';
import { QuizPlayService } from '../../quiz/services/quiz-play.service';
import { QueryQuizPlayDto } from 'src/modules/quiz/dto/quiz/query-quiz-play.dto';

@UseGuards(ChildAccessGuard)
@Controller('children/quizzes')
export class ChildrenQuizController {
  constructor(private readonly quizPlayService: QuizPlayService) {}

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
  @Get(':quizId/progress')
  async getProgress(@Param('quizId') quizId: string, @Req() request: Request) {
    const childId = request.child.childId;
    return this.quizPlayService.getProgress(childId, quizId);
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
