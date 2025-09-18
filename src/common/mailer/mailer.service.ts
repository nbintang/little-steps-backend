import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// import { UserJwtPayload } from '../../modules/auth/strategies/access-token.strategy';

interface UserInfo {
  name: string;
  id: string;
  email: string;
}
interface EmailTemplate {
  title: string;
  message: string;
  date: string;
  description: string;
}

@Injectable()
export class MailerService {
  private frontendUrl: string;
  constructor(
    private mailerService: NestMailerService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    // const PROD_URL = this.configService.get<string>('PROD_URL');
    this.frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://lokerin-frontend.vercel.app';
  }
  private dateFormatter(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} ${month.toString().padStart(2, '0')}, ${year}`;
  }
  private generateVerificationToken(payload: { email: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: '15m',
    });
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = this.jwtService.verify<any>(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
      });
      return {
        email: payload.email,
        role: payload.role,
        id: payload.sub,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Token expired, please resend email for verification',
        );
      }
      throw new BadRequestException('Invalid token');
    }
  }

  public async sendEmailConfirmation(userInfo: UserInfo): Promise<boolean> {
    const token = this.generateVerificationToken({
      email: userInfo.email,
    });

    const url = `${this.frontendUrl}/auth/verify?token=${token}`;
    const subject = 'Confirm your email';
    const template = this.getEmailConfirmationTemplate(userInfo.name);

    return this.sendEmail({
      to: userInfo.email,
      subject: `Hi ${userInfo.name} 👋, please ${subject}`,
      context: {
        ...template,
        name: userInfo.name,
        url,
        subject,
      },
    });
  }
  public async sendPasswordReset(userInfo: UserInfo): Promise<boolean> {
    const token = this.generateVerificationToken({
      email: userInfo.email,
    });

    const url = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    const subject = 'Reset your password';
    const template = this.getPasswordResetTemplate(userInfo.name);

    return this.sendEmail({
      to: userInfo.email,
      subject: `Hi ${userInfo.name} 👋, please ${subject}`,
      context: {
        ...template,
        name: userInfo.name,
        url,
        subject,
      },
    });
  }
  private async sendEmail(options: {
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
  private getEmailConfirmationTemplate(userName: string): EmailTemplate {
    return {
      title: `Selamat Datang, ${userName}! 🎉`,
      message:
        'Terima kasih telah bergabung dengan Wartech - platform berita teknologi terkini dan terdepan untuk solusi inovatif Anda.',
      date: this.dateFormatter(new Date()),
      description:
        'Untuk memulai perjalanan teknologi Anda bersama kami dan mengakses semua fitur eksklusif, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini.',
    };
  }
  private getPasswordResetTemplate(userName: string): EmailTemplate {
    return {
      title: 'Reset Kata Sandi 🔐',
      date: this.dateFormatter(new Date()),
      message: `Hai ${userName}, kami menerima permintaan untuk mereset kata sandi akun Wartech Anda.`,
      description:
        'Untuk keamanan akun Anda, klik tombol di bawah ini untuk mengatur ulang kata sandi dengan aman. Pastikan Anda membuat kata sandi yang kuat dan unik.',
    };
  }
}