import {
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../config/config.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthOtpService } from './auth-otp.service';
import * as argon2 from 'argon2';
@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly authOtpService: AuthOtpService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
  ) {}
  private hashString(data: string) {
    return argon2.hash(data);
  }
  async forgotPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    await this.authOtpService.sendPasswordReset({
      name: user.name,
      email: user.email,
      id: user.id,
    });
    return {
      message: 'Please check your email to reset your password',
    };
  }

  async resetPassword({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }) {
    const { email } = await this.authOtpService.decodeConfirmationToken(token);
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const hashedPassword = await this.hashString(newPassword);
    await this.userService.updatePassword(user.id, hashedPassword);
    return {
      message: 'Password Changed Successfully',
    };
  }
}
