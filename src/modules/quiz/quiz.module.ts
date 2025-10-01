import { Module } from '@nestjs/common';
import { QuizService } from './services/quiz.service';
import { QuizController } from './controllers/quiz.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { QuestionService } from './services/question.service';
import { QuestionController } from './controllers/question.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, QuestionController],
  providers: [QuizService, AccessControlService, QuestionService],
})
export class QuizModule {}
