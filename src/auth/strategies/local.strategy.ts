import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(payload): Promise<any> {
    const user = await this.authService.validateUser(payload, 'local');
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
