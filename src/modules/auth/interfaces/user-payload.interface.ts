import { UserRole } from '../../user/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  verified: boolean;
}

export interface UserJwtPayload extends JwtPayload {
  iat: number;
  exp: number;
}
