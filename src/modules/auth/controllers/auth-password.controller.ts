import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { AuthPasswordService } from '../services/auth-password.service';
import { Request } from 'express';

@Controller('auth')
export class AuthPasswordController {
  constructor(private readonly authPasswordService: AuthPasswordService) {}
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() { email }: { email: string },
    @Req() request: Request,
  ) {
    const user = request.user;
    if (user)
      throw new UnauthorizedException(
        `You are already logged in! Please logout first.`,
      );
    return await this.authPasswordService.forgotPassword(email);
  }
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() { newPassword }: { newPassword: string },
    @Query('token') token: string,
  ) {
    return await this.authPasswordService.resetPassword({
      token,
      newPassword,
    });
  }
}
