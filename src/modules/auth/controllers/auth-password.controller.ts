import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthPasswordService } from '../services/auth-password.service';
import { Request } from 'express';
import { ProviderGuard } from '../guards/provider.guard';
import { Provider } from '../decorators/provider.decorator';
import { AuthProvider } from '../enums/auth-provider.enum';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Controller('auth')
export class AuthPasswordController {
  constructor(private readonly authPasswordService: AuthPasswordService) {}

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Provider(AuthProvider.LOCAL)
  @UseGuards(ProviderGuard)
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
    @Body() dto: ResetPasswordDto,
    @Query('token') token: string,
  ) {
    return await this.authPasswordService.resetPassword({
      token,
      dto,
    });
  }
}
