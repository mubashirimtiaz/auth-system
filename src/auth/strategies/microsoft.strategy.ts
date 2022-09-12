import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { OAUTH_PROVIDER } from '@prisma/client';
import { Profile } from 'passport';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';
import { ConfigService } from '@nestjs/config';

interface MicrosoftProfile extends Profile {
  emails: [{ value: string; verified?: boolean }];
}
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${configService.get(
        'API_URL',
      )}/v1/api/auth/microsoft/redirect`,
      scope: ['user.read'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: MicrosoftProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { emails, id, displayName: name } = profile;

    try {
      const user = await this.authService.validateUserWithOAuth({
        email: emails[0]?.value,
        providerId: id,
        name,
        picture: null,
        providerName: OAUTH_PROVIDER.MICROSOFT,
        verified: emails[0]?.verified || true,
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
