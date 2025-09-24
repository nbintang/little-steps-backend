import { SetMetadata } from '@nestjs/common';
import { AuthProvider } from '../enums/auth-provider.enum';

export const PROVIDER_KEY = 'provider';
export const Provider = (provider: AuthProvider) =>
  SetMetadata(PROVIDER_KEY, provider);
