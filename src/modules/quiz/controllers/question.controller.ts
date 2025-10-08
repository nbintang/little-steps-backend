import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Body,
  Delete,
  UseGuards,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { InputQuestionDto } from '../dto/question/input-question.dto';
import { QuestionService } from '../services/question.service';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { UserRole } from '../../user/enums/user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { QueryQuizDto } from '../dto/quiz/query-quiz.dto';
@Roles(UserRole.ADMINISTRATOR)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('protected/quizzes/:quizId/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuestionsInQuiz(
    @Param('quizId') quizId: string,
    @Query() query: QueryQuizDto,
  ) {
    return await this.questionService.findQuestionsfromQuiz(quizId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findQuestionDetailFromQuizById(
    @Param('quizId') quizId: string,
    @Param('id') questionId: string,
  ) {
    return await this.questionService.findQuestionDetailFromQuizById(
      quizId,
      questionId,
    );
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addQuestionToQuiz(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: InputQuestionDto,
  ) {
    return await this.questionService.addQuestionToQuiz(
      quizId,
      createQuestionDto,
    );
  }
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async addQuestionsToQuiz(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: InputQuestionDto[],
  ) {
    return await this.questionService.addQuestionsToQuiz(
      quizId,
      createQuestionDto,
    );
  }
  @Patch('bulk')
  @HttpCode(HttpStatus.OK)
  async updateQuestionsInQuiz(
    @Param('quizId') quizId: string,
    @Body() updateQuestionsDto: InputQuestionDto[],
  ) {
    return await this.questionService.updateQuestionsInQuiz(
      quizId,
      updateQuestionsDto,
    );
  }
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateQuestionInQuiz(
    @Param('quizId') quizId: string,
    @Param('id') questionId: string,
    @Body() updateQuestionDto: InputQuestionDto,
  ) {
    return await this.questionService.updateQuestionInQuiz(
      quizId,
      questionId,
      updateQuestionDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteQuestionFromQuiz(
    @Param('quizId') quizId: string,
    @Param('id') questionId: string,
  ) {
    return await this.questionService.deleteQuestionFromQuiz(
      quizId,
      questionId,
    );
  }
}
