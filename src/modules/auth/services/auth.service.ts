import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../config/config.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as argon2 from 'argon2';
import { AuthProvider } from '../enums/auth-provider.enum';
import {
  GenerateJwtParams,
  GenerateJwtPayload,
  GenerateTokensResponse,
} from '../interfaces/generate-jwt.interface';
import { AuthOtpService } from './auth-otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authOtpService: AuthOtpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
  ) {}
  async validateRefreshToken(token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync<GenerateJwtPayload>(
        token,
        {
          secret: this.configService.jwt.refreshSecret,
        },
      );
      const user = await this.userService.findUserById(payload.sub);
      return !!user;
    } catch (error) {
      this.logger.log(error);
      return false;
    }
  }
  private hashString(data: string) {
    return argon2.hash(data);
  }
  private compareHash(plainText: string, hash: string) {
    return argon2.verify(hash, plainText);
  }

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
  async register(dto: RegisterDto) {
    const existedUser = await this.userService.findUserByEmail(dto.email);
    if (existedUser && existedUser.isRegistered) {
      throw new BadRequestException(
        'Email is already registered, please use another email',
      );
    }
    if (!dto.acceptedTerms) {
      throw new BadRequestException('Please accept our terms and condition');
    }
    const hashPassword = await this.hashString(dto.password);
    const newUser = await this.userService.createNewUser({
      ...dto,
      password: hashPassword,
    });
    await this.authOtpService.sendEmailConfirmation(newUser);
    return {
      message:
        'Register successfully!, please check you email for verification',
    };
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User is not registered');
    const isPasswordValid = await this.compareHash(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Incorrect Password');
    this.logger.log('user', user);
    return await this.generateJwtTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      provider: AuthProvider.LOCAL,
      is_registered: user.isRegistered,
    });
  }

  async verifyUser(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const { email } = await this.authOtpService.decodeConfirmationToken({
      token,
      secret: this.configService.jwt.verificationSecret,
    });
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (user.verified) {
      throw new BadRequestException('User is already verified');
    }
    await this.userService.verifyUserByEmail(user.email);
    return await this.generateJwtTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      provider: AuthProvider.LOCAL,
      is_registered: user.isRegistered,
    });
  }
  async refreshToken(userId: string): Promise<GenerateTokensResponse> {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new ForbiddenException('Access Denied');
    const { id, email, role, verified } = user;
    return await this.generateJwtTokens({
      userId: id,
      email,
      role,
      verified,
      provider: AuthProvider.LOCAL,
      is_registered: user.isRegistered,
    });
  }
  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  async logout() {
    return {
      message: 'Successfully signed out',
    };
  }
}
