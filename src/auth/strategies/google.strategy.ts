import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { OAUTH_PROVIDER } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const {
      emails,
      photos,
      id,
      name: { familyName: lastName, givenName: firstName },
    } = profile;

    const user = await this.authService.validateUserWithOAuth({
      email: emails[0].value,
      providerId: id,
      lastName,
      firstName,
      picture: photos[0].value,
      providerName: OAUTH_PROVIDER.GOOGLE,
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    done(null, user);
  }
}
