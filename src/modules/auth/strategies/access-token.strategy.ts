import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { UserRole } from '../../user/enums/user-role.enum';


export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  verified: boolean;
};

export interface UserJwtPayload extends JwtPayload {
  iat: number;
  exp: number;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(JWTStrategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }
  validate(payload: JwtPayload) {
    return payload;
  }
}
