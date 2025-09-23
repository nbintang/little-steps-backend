import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  LoggerService,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { CookieOptions, Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GoogleOauthUserResponse } from '../interfaces/google-response.interface';
import { UserService } from '../../user/user.service';
import { AuthGoogleService } from '../services/auth-google.service';
import { ProfileService } from '../../profile/profile.service';
import { GoogleRegisterDto } from '../dto/google-register.dto';
import { ConfigService } from '../../../config/config.service';

@Controller('auth')
export class AuthGoogleController {
  constructor(
    private readonly authGoogleService: AuthGoogleService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
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
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    const gUser = request.user as unknown as GoogleOauthUserResponse;
    let user = await this.userService.findUserByGoogleId(gUser.googleId);

    if (user && user.isRegistered) {
      const { accessToken, refreshToken } =
        await this.authGoogleService.googleLogin(user);
      if (accessToken && refreshToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookie(
          'refreshToken',
          refreshToken,
          this.setCookieOptions(isProduction),
        );
      }

      return response.redirect(
        `${this.configService.frontendUrl}/dashboard?access=${accessToken}`,
      );
    }

    if (!user) {
      user = await this.userService.createUserFromGoogleProvider(gUser);
    }
    const tempToken = await this.authGoogleService.generateTemporaryToken(user);
    return response.redirect(
      `${this.configService.frontendUrl}/complete-registration?token=${tempToken}`,
    );
  }

  @Post('complete-registration')
  async completeRegistration(
    @Body() dto: GoogleRegisterDto,
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authGoogleService.verifyTemporaryToken(token);
    const updatedUserStatus = await this.userService.updateUserRegistration(
      payload.sub,
    );
    const user = await this.profileService.completeProfile(
      dto,
      updatedUserStatus.id,
    );
    const { accessToken, refreshToken } =
      await this.authGoogleService.googleLogin(user);
    if (accessToken && refreshToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      response.cookie(
        'refreshToken',
        refreshToken,
        this.setCookieOptions(isProduction),
      );
    }
    return { data: { accessToken, refreshToken }, message: 'Login success' };
  }
}
