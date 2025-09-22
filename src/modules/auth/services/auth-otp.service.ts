import {
  HttpException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ConfigService } from '../../../config/config.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserJwtPayload } from '../interfaces/user-payload.interface';

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
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: Logger,
  ) {
    const PROD_URL = this.configService.frontendUrl;
    this.frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api'
        : PROD_URL;
  }

  private generateVerificationToken(payload: { email: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.jwt.verificationTokenSecret,
      expiresIn: '5m',
    });
  }
  public async decodeConfirmationToken(token: string) {
    try {
      const payload = this.jwtService.verify<UserJwtPayload>(token, {
        secret: this.configService.jwt.verificationTokenSecret,
      });

      return {
        email: payload.email,
        role: payload.role,
        id: payload.sub,
      };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
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
  public async sendPasswordReset(userInfo: UserInfo) {
    const token = this.generateVerificationToken({
      email: userInfo.email,
    });

    const url = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    const subject = 'Reset your password';
    const template = this.mailerService.getPasswordResetTemplate(userInfo.name);

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
}
