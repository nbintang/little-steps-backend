import {
  Inject,
  Injectable,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '../../../config/config.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { AuthProvider } from '../enums/auth-provider.enum';
import { User } from '@prisma/client';
import {
  GenerateJwtParams,
  GenerateJwtPayload,
  GenerateTokensResponse,
} from '../interfaces/generate-jwt.interface';

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
  ) {}

  private async generateJwtTokens({
    userId,
    email,
    role,
    verified,
    provider,
    is_registered,
  }: GenerateJwtParams): Promise<GenerateTokensResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        sub: userId,
        email,
        role,
        verified,
        provider,
        is_registered,
      }),
      this.jwtService.signAsync(
        { sub: userId, email, role, verified, provider, is_registered },
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

  async googleLogin(user: User) {
    if (user.provider !== AuthProvider.GOOGLE) {
      throw new UnauthorizedException('Account used on different provider');
    }

    return await this.generateJwtTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      provider: AuthProvider.GOOGLE,
      is_registered: user.isRegistered,
    });
  }

  async generateTemporaryToken(user: User): Promise<string> {
    const payload: GenerateJwtPayload = {
      role: user.role,
      verified: user.verified,
      provider: user.provider as AuthProvider,
      email: user.email,
      sub: user.id,
      is_registered: user.isRegistered,
    };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.jwt.temporarySecret,
      expiresIn: '15m',
    });
  }

  async verifyTemporaryToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<GenerateJwtPayload>(
        token,
        {
          secret: this.configService.jwt.temporarySecret,
        },
      );
      return payload;
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
