import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtTOKEN, User } from '../interface/auth.interface';
import { StrategyType } from '../enum/auth.enum';
import { AUTH_MESSAGE } from '../message/auth.message';
import { throwApiErrorResponse } from 'src/utils/functions';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtTOKEN): Promise<User> {
    try {
      const user = await this.authService.validateUser(
        payload,
        StrategyType.JWT,
      );

      if (!user) {
        throwApiErrorResponse({
          response: {
            message: AUTH_MESSAGE.error.USER_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      return user;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
