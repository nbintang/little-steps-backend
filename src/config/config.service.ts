import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // ===== App =====
  get port(): number {
    return this.configService.get<number>('app.port');
  }
  get frontendUrl(): string {
    return this.configService.get<string>('app.frontendUrl');
  }
  get backendUrl(): string {
    return this.configService.get<string>('app.backendUrl');
  }
  get databaseUrl(): string {
    return this.configService.get<string>('app.databaseUrl');
  }

  // ===== Auth =====
  get jwt(): {
    accessSecret: string;
    refreshSecret: string;
    verificationSecret: string;
    temporarySecret: string;
  } {
    return {
      accessSecret: this.configService.get<string>('auth.jwtAccessSecret'),
      refreshSecret: this.configService.get<string>('auth.jwtRefreshSecret'),
      verificationSecret: this.configService.get<string>(
        'auth.jwtTemporarySecret',
      ),
      temporarySecret: this.configService.get<string>(
        'auth.jwtTemporarySecret',
      ),
    };
  }

  get google(): {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    callbackUrl: string;
  } {
    return {
      clientId: this.configService.get<string>('auth.googleClientId'),
      clientSecret: this.configService.get<string>('auth.googleClientSecret'),
      refreshToken: this.configService.get<string>('auth.googleRefreshToken'),
      callbackUrl: this.configService.get<string>('auth.googleCallbackUrl'),
    };
  }

  // ===== Mail =====
  get mail(): {
    user: string;
    pass: string;
    host: string;
    port: number;
    secure: boolean;
    from: string;
  } {
    return {
      user: this.configService.get<string>('mail.user'),
      pass: this.configService.get<string>('mail.pass'),
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      from: this.configService.get<string>('mail.from'),
      secure: this.configService.get<boolean>('mail.boolean'),
    };
  }

  // ===== Cloudinary =====
  get cloudinary(): {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  } {
    return {
      cloudName: this.configService.get<string>('cloudinary.cloudName'),
      apiKey: this.configService.get<string>('cloudinary.apiKey'),
      apiSecret: this.configService.get<string>('cloudinary.apiSecret'),
    };
  }
}
