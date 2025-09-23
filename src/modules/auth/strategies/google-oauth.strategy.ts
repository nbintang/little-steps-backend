import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '../../../config/config.service';
import {
  type Profile,
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GoogleOauthUserResponse } from '../interfaces/google-response.interface';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    super({
      clientID: configService.google.clientId,
      clientSecret: configService.google.clientSecret,
      callbackURL: configService.google.callbackUrl,
      scope: ['openid', 'profile', 'email'],
    } as StrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const {
      _json: { sub, given_name, family_name, picture, email, email_verified },
    } = profile;

    const user: GoogleOauthUserResponse = {
      googleId: sub,
      name: `${given_name} ${family_name}`.trim(),
      avatarUrl: picture,
      email,
      verified: email_verified,
    };
    done(null, user);
  }
}
