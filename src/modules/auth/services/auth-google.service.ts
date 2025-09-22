import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '../../../config/config.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { GenerateTokenResponse } from '../interfaces/token-response.interface';
import * as argon2 from 'argon2';
import { GoogleOauthUserResponse } from '../interfaces/google-response.interface';

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
  ) {}
  private hashString(data: string) {
    return argon2.hash(data);
  }

  private async generateJwtTokens({
    userId,
    email,
    role,
    verified,
  }: {
    userId: string;
    email: string;
    role: string;
    verified: boolean;
  }): Promise<GenerateTokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email, role, verified }),
      this.jwtService.signAsync(
        { sub: userId, email, role, verified },
        {
          secret: this.configService.jwt.refreshSecret,
          expiresIn: '1d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(user: GoogleOauthUserResponse) {}

  async googleRegister() {}
}
