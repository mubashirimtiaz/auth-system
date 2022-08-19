import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { OAUTH_PROVIDER } from '@prisma/client';
import { Profile } from 'passport';
import { AUTH_MESSAGE } from '../message/auth.message';
import { throwApiErrorResponse } from 'src/utils/functions';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/v1/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const {
      emails,
      photos,
      id,
      name: { familyName: lastName, givenName: firstName },
    } = profile;
    try {
      let user = await this.authService.validateUserWithOAuth({
        email: emails[0].value,
        providerId: id,
        lastName,
        firstName,
        picture: photos[0].value,
        providerName: OAUTH_PROVIDER.GOOGLE,
      });

      if (!user) {
        throwApiErrorResponse({
          response: {
            message: AUTH_MESSAGE.error.USER_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      user = {
        email: user?.email,
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
      };
      done(null, user);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
