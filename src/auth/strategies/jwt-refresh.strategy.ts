import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtTOKEN, User, UserPayload } from '../interface/auth.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtTOKEN): Promise<UserPayload> {
    try {
      const user = await this.authService.validateUser(payload, 'jwt');

      if (!user) {
        throw new UnauthorizedException();
      }
      return {
        email: user?.email,
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
