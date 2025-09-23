import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/user-payload.interface';

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
