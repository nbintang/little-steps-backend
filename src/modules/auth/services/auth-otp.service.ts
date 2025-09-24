import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ConfigService } from '../../../config/config.service';
import { UserJwtPayload } from '../interfaces/user-payload.interface';
import { UserService } from 'src/modules/user/user.service';

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
    private userService: UserService,
  ) {
    const PROD_URL = this.configService.frontendUrl;
    this.frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api'
        : PROD_URL;
  }

  private async generateVerificationToken({
    email,
    secret,
  }: {
    email: string;
    secret: string;
  }): Promise<string> {
    return await this.jwtService.signAsync(
      { email },
      {
        secret,
        expiresIn: '2m',
      },
    );
  }
  public async decodeConfirmationToken({
    token,
    secret,
  }: {
    token: string;
    secret: string;
  }) {
    try {
      const payload = await this.jwtService.verifyAsync<UserJwtPayload>(token, {
        secret,
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
      secret: this.configService.jwt.verificationSecret,
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
      secret: this.configService.jwt.resetPasswordSecret,
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

  public async resendVerification(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (user.verified) throw new BadRequestException('User already verified');
    if (!user) throw new NotFoundException('User not found');
    await this.sendEmailConfirmation({
      ...user,
    });
    return {
      message: 'Email sent successfully',
    };
  }
}
