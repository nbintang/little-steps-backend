import { AuthProvider } from '../enums/auth-provider.enum';

export interface GenerateJwtParams {
  userId: string;
  email: string;
  role: string;
  verified: boolean;
  provider: AuthProvider;
  is_registered: boolean;
}
export interface GenerateTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GenerateJwtPayload {
  sub: string;
  email: string;
  role: string;
  verified: boolean;
  provider: AuthProvider;
  is_registered: boolean;
}
