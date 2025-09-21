import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ConfigService } from '../../../config/config.service';

interface UserInfo {
  name: string;
  id: string;
  email: string;
}

@Injectable()
export class AuthOtpService {
  protected frontendUrl: string;
  constructor(
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const PROD_URL = this.configService.frontendUrl;
    this.frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : PROD_URL;
  }

  private generateVerificationToken(payload: { email: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.jwtVerificationTokenSecret,
      expiresIn: '5m',
    });
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = this.jwtService.verify<any>(token, {
        secret: this.configService.jwtVerificationTokenSecret,
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

  public async sendEmailConfirmation(userInfo: UserInfo) {
    const token = this.generateVerificationToken({
      email: userInfo.email,
    });

    const url = `${this.frontendUrl}/auth/verify?token=${token}`;
    const subject = 'Confirm your email';
    const template = this.mailerService.getEmailConfirmationTemplate(
      userInfo.name,
    );

    const sendedEmail = await this.mailerService.sendEmail({
      to: userInfo.email,
      subject: `Hi ${userInfo.name} 👋, please ${subject}`,
      context: {
        ...template,
        name: userInfo.name,
        url,
        subject,
      },
    });
    if (!sendedEmail) {
      throw new HttpException('Something Went Wrong', 500);
    }
  }
  public async sendPasswordReset(userInfo: UserInfo): Promise<boolean> {
    const token = this.generateVerificationToken({
      email: userInfo.email,
    });

    const url = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    const subject = 'Reset your password';
    const template = this.mailerService.getPasswordResetTemplate(userInfo.name);

    return this.mailerService.sendEmail({
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
}
