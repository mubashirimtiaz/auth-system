import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { OAUTH_PROVIDER } from '@prisma/client';
import { Profile } from 'passport';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';
import { ConfigService } from '@nestjs/config';

interface GoogleProfile extends Profile {
  emails: [{ value: string; verified: boolean }];
}
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${configService.get(
        'API_URL',
      )}/v1/api/auth/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { emails, photos, id, displayName: name } = profile;
    try {
      const user = await this.authService.validateUserWithOAuth({
        email: emails[0]?.value,
        providerId: id,
        name,
        picture: photos[0].value,
        providerName: OAUTH_PROVIDER.GOOGLE,
        verified: emails[0]?.verified,
      });

      if (!user) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.user.error.USER_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      done(null, user);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
