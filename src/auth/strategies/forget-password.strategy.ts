import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtTOKEN, UserPayload } from '../interface/auth.interface';
import { StrategyType } from '../enum/auth.enum';
import { AUTH_MESSAGE } from '../message/auth.message';
import { throwApiErrorResponse } from 'src/utils/functions';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-forget-password-token',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_FORGET_PASSWORD_SECRET,
    });
  }

  async validate(payload: JwtTOKEN) {
    console.log(payload);
  }
}
