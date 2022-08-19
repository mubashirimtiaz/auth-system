import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User, UserPayload } from '../interface/auth.interface';
import { StrategyType } from '../enum/auth.enum';
import { AUTH_MESSAGE } from '../message/auth.message';
import { ApiErrorResponse } from 'src/classes/global.class';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserPayload> {
    try {
      const user: User = await this.authService.validateUser(
        { email, password },
        StrategyType.LOCAL,
      );
      if (!user) {
        throw new ApiErrorResponse(
          {
            message: AUTH_MESSAGE.error.USER_NOT_FOUND,
            success: false,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      throw new ApiErrorResponse(
        { message: error?.response?.message, success: false },
        error.status,
      );
    }
  }
}