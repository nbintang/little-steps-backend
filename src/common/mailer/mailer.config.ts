import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

import { join } from 'path';
import { ConfigService } from '../../config/config.service';

export const MailerConfig: MailerAsyncOptions['useFactory'] = async (
  config: ConfigService,
) => ({
  transport: {
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
    debug: true,
    logger: true,
  },
  defaults: {
    from: config.mail.from,
    replyTo: config.mail.user,
  },
  template: {
    // For production : join(__dirname, '..', 'mailer', 'templates'),
    dir: join(__dirname, '..', 'mailer', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
});
