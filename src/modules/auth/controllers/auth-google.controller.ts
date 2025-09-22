import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  LoggerService,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthOtpService } from '../services/auth-otp.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GoogleOauthUserResponse } from '../interfaces/google-response.interface';

@Controller('auth')
export class AuthGoogleController {
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

  @Get('google-login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  async googleAuthLogin() {}

  @Get('google-login/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() request: Request) {
    const userCallbackResponse = request.user as unknown as GoogleOauthUserResponse ;
    
    return { data: userCallbackResponse };
  }
}
