import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { ParentModule } from '../parent/parent.module';
import { ChildrenFictionController } from './controllers/children-fiction.controller';
import { ChildrenQuizController } from './controllers/children-quiz.controller';
import { QuizModule } from '../quiz/quiz.module';
import { ChildrenControllerController } from './controllers/children.controller';
import { ContentModule } from '../content/content.module';
@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ParentModule,
    QuizModule,
    ContentModule,
  ],
  controllers: [
    ChildrenFictionController,
    ChildrenQuizController,
    ChildrenControllerController,
  ],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
