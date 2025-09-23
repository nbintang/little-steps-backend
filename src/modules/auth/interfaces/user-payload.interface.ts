import { UserRole } from '../../user/enums/user-role.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  verified: boolean;
  provider: AuthProvider;
  is_registered: boolean;
}

export interface UserJwtPayload extends JwtPayload {
  iat: number;
  exp: number;
}
