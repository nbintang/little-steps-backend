import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  LoggerService,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthService } from '../services/auth.service';
import { AuthOtpService } from '../services/auth-otp.service';

@Controller('auth')
export class AuthOtpController {
  constructor(
    private readonly authService: AuthService,
    private readonly authOtpService: AuthOtpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}
  private setCookieOptions(isProduction: boolean): CookieOptions {
    return {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  async verify(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email } = await this.authOtpService.decodeConfirmationToken(token);
    const { accessToken, refreshToken } =
      await this.authService.verifyUser(email);
    if (accessToken && refreshToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      response.cookie(
        'refreshToken',
        refreshToken,
        this.setCookieOptions(isProduction),
      );
    }
    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
