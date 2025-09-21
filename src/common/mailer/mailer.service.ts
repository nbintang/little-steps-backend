import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { format } from 'date-fns';

interface EmailTemplate {
  title: string;
  message: string;
  date: string;
  description: string;
}

@Injectable()
export class MailerService {
  constructor(
    private mailerService: NestMailerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  public async sendEmail(options: {
    to: string;
    subject: string;
    context: Record<string, any>;
  }): Promise<boolean> {
    try {
      this.logger.log(options.context);
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: 'confirmation',
        context: options.context,
      });
      this.logger.log(`Email sent to ${options.to} successfully.`);
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${err.message}`,
      );
      return false;
    }
  }
  public getEmailConfirmationTemplate(userName: string): EmailTemplate {
    return {
      title: `Selamat Datang, ${userName}! 🎉`,
      message:
        'Terima kasih telah bergabung dengan Wartech - platform berita teknologi terkini dan terdepan untuk solusi inovatif Anda.',
      date: format(new Date(), 'd MM, yyyy'),
      description:
        'Untuk memulai perjalanan teknologi Anda bersama kami dan mengakses semua fitur eksklusif, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini.',
    };
  }
  public getPasswordResetTemplate(userName: string): EmailTemplate {
    return {
      title: 'Reset Kata Sandi 🔐',
      date: format(new Date(), 'd MM, yyyy'),
      message: `Hai ${userName}, kami menerima permintaan untuk mereset kata sandi akun Wartech Anda.`,
      description:
        'Untuk keamanan akun Anda, klik tombol di bawah ini untuk mengatur ulang kata sandi dengan aman. Pastikan Anda membuat kata sandi yang kuat dan unik.',
    };
  }
}
