import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessControlService } from './shared/access-control.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { MailerModule } from '../../common/mailer/mailer.module';
import { AuthOtpService } from './services/auth-otp.service';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [
    PassportModule,
    UserModule,
    ConfigModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: await configService.jwtAccessSecret,
        signOptions: { expiresIn: '30s' },
      }),
    }),
  ],
  providers: [
    ConfigService,
    AuthService,
    AuthOtpService,
    AccessControlService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleOauthStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
