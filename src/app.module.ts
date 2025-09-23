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

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    ConfigModule,
    MailerModule,
    AuthModule,
    UserModule,
    ProfileModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
