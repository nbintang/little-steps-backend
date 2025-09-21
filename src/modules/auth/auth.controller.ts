import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Res,
  UnauthorizedException,
  Inject,
  LoggerService,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService, GenerateTokenResponse } from './services/auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthOtpService } from './services/auth-otp.service';
import { CookieOptions, Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const newUser = await this.authService.register(dto);
    if (newUser) await this.authOtpService.sendEmailConfirmation(newUser);
    return {
      message:
        'Register successfully!, please check you email for verification',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() dto: LoginDto,
  ) {
    const existedTokenCookie = request.cookies['refreshToken'];
    if (existedTokenCookie) {
      try {
        const isValidToken =
          await this.authService.validateRefreshToken(existedTokenCookie);
        if (isValidToken) {
          throw new UnauthorizedException('User already signed in!');
        }
        response.clearCookie(
          'refreshToken',
          this.setCookieOptions(process.env.NODE_ENV === 'production'),
        );
      } catch (error) {
        this.logger.log(error);
        response.clearCookie(
          'refreshToken',
          this.setCookieOptions(process.env.NODE_ENV === 'production'),
        );
      }
    }
    const { accessToken, refreshToken } = await this.authService.login(dto);
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

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshTokens(@Req() request: Request) {
    const userId = request.user.sub;
    const tokens = await this.authService.refreshToken(userId);
    return {
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @Delete('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    response.clearCookie('refreshToken', this.setCookieOptions(isProduction));
    return await this.authService.logout();
  }

}
