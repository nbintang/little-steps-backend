import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthOtpService } from '../services/auth-otp.service';

@Controller('auth')
export class AuthOtpController {
  constructor(
    private readonly authService: AuthService,
    private readonly authOtpService: AuthOtpService,
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
  @HttpCode(HttpStatus.OK)
  async verify(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

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
      data: { accessToken, refreshToken },
      message: 'Verification successful',
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() body: { email: string }) {
    return await this.authOtpService.resendVerification(body.email);
  }
}
