import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('app.port');
  }

  get jwtAccessSecret(): string {
    return this.configService.get<string>('auth.jwtAccessSecret');
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
