import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './config/config.module';
import { MailerModule } from './common/mailer/mailer.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ContentModule } from './modules/content/content.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { MediaModule } from './modules/media/media.module';
import { ParentModule } from './modules/parent/parent.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ForumModule } from './modules/forum/forum.module';
import { ChildrenModule } from './modules/children/children.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    ConfigModule,
    MailerModule,
    AuthModule,
    UserModule,
    ProfileModule,
    ContentModule,
    CloudinaryModule,
    MediaModule,
    ParentModule,
    QuizModule,
    ForumModule,
    ChildrenModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
