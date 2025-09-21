import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';

import { MailerConfig } from './mailer.config';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
@Module({
  imports: [
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: MailerConfig,
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
