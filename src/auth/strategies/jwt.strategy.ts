import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtTOKEN } from '../interface/auth.interface';
import { User } from 'src/common/interfaces';
import { StrategyType } from '../enum/auth.enum';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
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
            message: MESSAGE.user.error.USER_NOT_FOUND,
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
