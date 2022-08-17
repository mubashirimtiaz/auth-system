import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User, UserPayload } from '../interface/auth.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserPayload> {
    try {
      const user: User = await this.authService.validateUser(
        { email, password },
        'local',
      );
      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
