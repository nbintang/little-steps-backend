import { Module } from '@nestjs/common';
import { QuizService } from './services/quiz.service';
import { QuizController } from './controllers/quiz.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { QuestionService } from './services/question.service';
import { QuestionController } from './controllers/question.controller';
import { QuizPlayService } from './services/quiz-play.service';
import { PublicQuizController } from './controllers/public-quiz.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, QuestionController, PublicQuizController],
  providers: [
    QuizService,
    QuizPlayService,
    AccessControlService,
    QuestionService,
  ],
  exports: [QuizService, QuizPlayService],
})
export class QuizModule {}
