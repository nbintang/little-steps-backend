import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { ConfigModule } from 'src/config/config.module';
import { AccessControlService } from './shared/access-control.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { MailerModule } from '../../common/mailer/mailer.module';

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
        secret: configService.jwtAccessSecret,
        signOptions: { expiresIn: '30s' },
      }),
    }),
  ],
  providers: [
    JwtService,
    ConfigService,
    AuthService,
    AccessControlService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleOauthStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
