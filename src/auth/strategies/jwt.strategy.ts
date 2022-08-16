import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload, 'jwt');

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      email: user?.email,
      sub: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };
  }
}
