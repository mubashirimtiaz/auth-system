import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { StrategyType } from '../enum/auth.enum';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';
import { User } from 'src/common/interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    try {
      const user: User = await this.authService.validateUser(
        { email, password },
        StrategyType.LOCAL,
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
