import {
  Controller,
  Post,
  Body,
  Delete,
  Req,
  Res,
  UnauthorizedException,
  Inject,
  LoggerService,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { CookieOptions, Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { ProviderGuard } from '../guards/provider.guard';
import { Provider } from '../decorators/provider.decorator';
import { AuthProvider } from '../enums/auth-provider.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // ✅ 1️⃣ Gunakan isDevelopment agar cookie tetap konsisten di dev dan prod
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private getCookieOptions(): CookieOptions {
    return {
      sameSite: this.isDevelopment ? 'lax' : 'none',
      secure: !this.isDevelopment,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 jam
      path: '/', // penting agar bisa dihapus di logout
    };
  }

  @Post('register')
  @Provider(AuthProvider.LOCAL)
  @UseGuards(ProviderGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Provider(AuthProvider.LOCAL)
  @UseGuards(ProviderGuard)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() dto: LoginDto,
  ) {
    const existedTokenCookie = request.cookies['refreshToken'];
    if (existedTokenCookie) {
      try {
        const isValidToken = await this.authService.validateRefreshToken(existedTokenCookie);
        if (isValidToken) {
          throw new UnauthorizedException('User already signed in!');
        }
        response.clearCookie('refreshToken', this.getCookieOptions());
      } catch (error) {
        this.logger.log(error);
        response.clearCookie('refreshToken', this.getCookieOptions());
      }
    }

    const { accessToken, refreshToken } = await this.authService.login(dto);

    if (accessToken && refreshToken) {
      response.cookie('refreshToken', refreshToken, this.getCookieOptions());
    }

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Req() request: Request) {
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
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshToken', this.getCookieOptions());
    response.clearCookie('childToken', this.getCookieOptions());
    return await this.authService.logout();
  }
}
