import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JSON_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    return {
      email: payload.email,
      id: payload.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
