import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('app.port');
  }
  get frontendUrl(): string {
    return this.configService.get<string>('app.frontendUrl');
  }
  get backendUrl(): string {
    return this.configService.get<string>('app.backendUrl');
  }

  get jwtAccessSecret(): string {
    return this.configService.get<string>('auth.jwtAccessSecret');
  }
  get jwtRefreshSecret(): string {
    return this.configService.get<string>('auth.jwtRefreshSecret');
  }
  get jwtVerificationTokenSecret(): string {
    return this.configService.get<string>('auth.jwtVerificationTokenSecret');
  }

  get googleClientId(): string {
    return this.configService.get<string>('auth.googleClientId');
  }
  get googleClientSecret(): string {
    return this.configService.get<string>('auth.googleClientSecret');
  }
  get googleRefreshToken(): string {
    return this.configService.get<string>('auth.googleRefreshToken');
  }
  get googleCallbackUrl(): string {
    return this.configService.get<string>('auth.googleCallbackUrl');
  }
}
