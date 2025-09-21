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
import { User } from '@prisma/client';

export interface GenerateTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
  ) {}
  async validateRefreshToken(token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwt.refreshSecret,
      });
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

  private decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  private compareHash(plainText: string, hash: string) {
    return argon2.verify(hash, plainText);
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
  async register(dto: RegisterDto): Promise<User> {
    const existedUser = await this.userService.findUserById(dto.email);
    this.logger.log(dto);
    if (existedUser) {
      throw new BadRequestException(
        'User already exist, please use another account',
      );
    }
    if (!dto.acceptedTerms) {
      throw new BadRequestException('Please accept our terms and condition');
    }
    const hashPassword = await this.hashString(dto.password);
    return await this.userService.createNewUser({
      ...dto,
      password: hashPassword,
    });
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User is not registered');
    const isPasswordValid = await this.compareHash(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Incorrect Password');
    return await this.generateJwtTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
    });
  }

  async verifyUser(email: string) {
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
    });
  }
  async refreshToken(
    userId: string,
  ): Promise<GenerateTokenResponse> {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new ForbiddenException('Access Denied');
    const { id, email, role, verified } = user;
    return await this.generateJwtTokens({
      userId: id,
      email,
      role,
      verified,
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
