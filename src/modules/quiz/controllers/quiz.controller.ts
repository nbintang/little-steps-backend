import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Patch,
} from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { CreateQuizDto } from '../dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '../dto/quiz/update-quiz.dto';
import { Request } from 'express';
import { QueryQuizDto } from '../dto/quiz/query-quiz.dto';

@Roles(UserRole.ADMINISTRATOR)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuiz(
    @Req() request: Request,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    const userId = request.user.sub;
    return await this.quizService.createQuiz(userId, createQuizDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllQuizzes(@Query() query: QueryQuizDto) {
    return await this.quizService.findAllQuizzes(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findQuizById(@Param('id') quizId: string) {
    return await this.quizService.findQuizById(quizId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateQuiz(
    @Param('id') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return await this.quizService.updateQuiz(quizId, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteQuiz(@Param('id') quizId: string, @Req() request: Request) {
    const userId = request.user.sub;
    return await this.quizService.deleteQuiz(quizId, userId);
  }
}
