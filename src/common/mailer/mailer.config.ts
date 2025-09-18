import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const MailerConfig: MailerAsyncOptions['useFactory'] = async (
  config: ConfigService,
) => ({
  transport: {
    host: config.get<string>('mail.emailHost'),
    port: config.get<number>('mail.emailPort'),
    secure: config.get<boolean>('mail.emailSecure'),
    auth: {
      user: config.get<string>('mail.emailUser'),
      pass: config.get<string>('mail.emailPass'),
    },
    debug: true,
    logger: true,
  },
  defaults: {
    from: config.get<string>('mail.emailFrom'),
    replyTo: config.get<string>('mail.emailUser'),
  },
  template: {
    dir: join(__dirname, '..', 'mail', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
});
