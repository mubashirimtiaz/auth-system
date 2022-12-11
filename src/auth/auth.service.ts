import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtTOKEN } from './interface/auth.interface';
import { User } from 'src/common/interfaces';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { StrategyType } from './enum/auth.enum';
import { AuthToken, UserValidationData } from './type/auth.type';
import {
  addHrsAheadOfTime,
  ApiSuccessResponse,
  generateCode,
  throwApiErrorResponse,
} from 'src/common/functions';
import { ApiResponse } from 'src/common/interfaces';
import { AUTH_MESSAGE } from './message/auth.message';
import { MESSAGE } from 'src/common/messages';
import { Token } from 'src/common/types';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { OAUTH_PROVIDER } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async login(payload: User): Promise<ApiResponse<AuthToken>> {
    if (!payload.emailVerified) {
      throwApiErrorResponse({
        response: {
          message: MESSAGE.user.error.USER_EMAIL_NOT_VERIFIED,
          success: false,
        },
        status: HttpStatus.BAD_REQUEST,
      });
    }
    const accessToken = this.getAccessToken({
      email: payload.email,
      sub: payload.id,
      name: payload.name,
    });
    const refreshToken = this.getRefreshToken({
      email: payload.email,
      sub: payload.id,
      name: payload.name,
    });

    return ApiSuccessResponse<AuthToken>(
      true,
      MESSAGE.user.success.USER_LOGGED_IN,
      {
        accessToken,
        refreshToken,
        user: payload,
      },
    );
  }

  async signup({
    name,
    email,
    password,
  }: SignUpDTO): Promise<ApiResponse<AuthToken | Token>> {
    try {
      const user = await this.validateUserWithOAuth({
        name,
        email,
        providerName: OAUTH_PROVIDER.EMAIL_PASSWORD,
        password,
      });

      const payload = {
        email: user.email,
        sub: user.id,
        name: user.name,
      };
      console.log(user);

      if (!user?.emailVerified) {
        return this.sendVerifyEmail(user, payload);
      }

      const accessToken = await this.getAccessToken(payload);

      const refreshToken = await this.getRefreshToken(payload);

      return ApiSuccessResponse<AuthToken>(
        true,
        MESSAGE.user.success.USER_CREATED,
        {
          accessToken,
          refreshToken,
          user,
        },
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  oauthRedirect(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const code = this.jwtService.sign(payload, {
      secret:
        process.env.VERIFY_OAUTH_SECRET + user.code.registration?.value || '',
      expiresIn: process.env.VERIFY_OAUTH_EXPIRATION_TIME,
    });
    const url = `${this.configService.get('WEB_URL')}/verify/code?code=${code}`;
    return url;
  }

  refreshAccessToken(user: User): ApiResponse<AuthToken> {
    const accessToken = this.getAccessToken({
      email: user.email,
      sub: user.id,
      name: user.name,
    });
    return ApiSuccessResponse<AuthToken>(
      true,
      AUTH_MESSAGE.success.REFRESH_TOKEN_VERIFIED,
      {
        accessToken,
      },
    );
  }

  async validateUser(
    payload: SignInDTO | JwtTOKEN,
    strategy: StrategyType,
  ): Promise<User> {
    try {
      const user: User = await this.findUniqueUser({ email: payload.email });

      if (user && strategy === StrategyType.JWT) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return user;
      }

      if ('password' in payload && strategy === StrategyType.LOCAL) {
        if (!user) {
          throwApiErrorResponse({
            response: {
              message: MESSAGE.user.error.USER_INVALID_EMAIL,
              success: false,
              data: {
                fields: ['email'],
              },
            },
            status: HttpStatus.BAD_REQUEST,
          });
        }

        if (!user?.hash) {
          throwApiErrorResponse({
            response: {
              message: MESSAGE.user.error.USER_INVALID_PASSWORD,
              success: false,
              data: {
                fields: ['password'],
              },
            },
            status: HttpStatus.BAD_REQUEST,
          });
        }
        const isValidPassword = await bcrypt.compare(
          payload.password,
          user.hash,
        );
        if (!isValidPassword) {
          throwApiErrorResponse({
            response: {
              message: MESSAGE.user.error.USER_INVALID_PASSWORD,
              success: false,
              data: {
                fields: ['password'],
              },
            },
            status: HttpStatus.BAD_REQUEST,
          });
        }

        return user;
      }
      return null;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async validateUserWithOAuth({
    email,
    password = null,
    providerId = null,
    name = 'USER',
    picture,
    providerName,
    verified,
  }: UserValidationData): Promise<User> {
    try {
      const user: User = await this.findUniqueUser({ email });
      if (user) {
        const providerExists = user.oAuthProviders.find(
          (elem) => elem.provider === providerName,
        );

        if (providerExists) {
          if (providerName === 'EMAIL_PASSWORD') {
            throwApiErrorResponse({
              response: {
                message: MESSAGE.user.error.USER_ALREADY_EXISTS,
                success: false,
              },
              status: HttpStatus.CONFLICT,
            });
          } else {
            const updatedCode = await this.prismaService.code.update({
              where: {
                userId: user.id,
              },
              data: {
                registration: {
                  value: generateCode(),
                  exp: addHrsAheadOfTime(1),
                },
              },
            });
            user.code = updatedCode;
          }

          return user;
        }
        const updatedUser = await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            ...(password && { hash: password }),
            updatedAt: new Date(),
            oAuthProviders: {
              create: {
                provider: providerName,
                ...(providerId && { providerId }),
              },
            },
            code: {
              update: {
                registration: {
                  value: generateCode(),
                  exp: addHrsAheadOfTime(1),
                },
              },
            },
          },
          include: {
            oAuthProviders: {
              select: {
                provider: true,
              },
            },
            code: {
              select: {
                registration: true,
                emailVerification: true,
                forgetPassword: true,
              },
            },
          },
        });

        return updatedUser;
      }

      const newUser = await this.prismaService.user.create({
        data: {
          name,
          email,
          ...(verified && { emailVerified: verified }),
          ...(password && { hash: password }),
          ...(picture && { picture }),
          code: {
            create: {
              ...(providerName === OAUTH_PROVIDER.EMAIL_PASSWORD
                ? {
                    emailVerification: {
                      value: generateCode(),
                      exp: addHrsAheadOfTime(1),
                    },
                  }
                : {
                    registration: {
                      value: generateCode(),
                      exp: addHrsAheadOfTime(1),
                    },
                  }),
            },
          },
          oAuthProviders: {
            create: {
              provider: providerName,
              ...(providerId && { providerId }),
            },
          },
        },
        include: {
          oAuthProviders: {
            select: {
              provider: true,
            },
          },
          code: {
            select: {
              registration: true,
              emailVerification: true,
              forgetPassword: true,
            },
          },
        },
      });

      return newUser;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async sendVerifyEmail(
    user: User,
    payload: Partial<JwtTOKEN>,
  ): Promise<ApiResponse<Token>> {
    const token = this.jwtService.sign(payload, {
      secret: process.env.VERIFY_EMAIL_SECRET + user.email,
      expiresIn: process.env.VERIFY_EMAIL_EXPIRATION_TIME,
    });
    const url = `${this.configService.get('WEB_URL')}/verify/email?code=${
      user?.code?.emailVerification?.value
    }&token=${token}`;
    await this.mailService.sendMail(
      user?.email,
      { name: user?.name, url },
      'MY APP! Verify Email',
      './verify-email',
    );
    return ApiSuccessResponse<Token>(
      true,
      MESSAGE.mail.success.VERIFY_EMAIL_SENT,
      { token },
    );
  }

  async findUniqueUser(query: {
    [key: string]: string | number;
  }): Promise<User> {
    const user: User = await this.prismaService.user.findUnique({
      where: query,
      include: {
        oAuthProviders: {
          select: {
            provider: true,
          },
        },
        code: {
          select: {
            registration: true,
            emailVerification: true,
            forgetPassword: true,
          },
        },
      },
    });
    return user;
  }

  getAccessToken(payload: JwtTOKEN): string {
    const accessToken: string = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return accessToken;
  }

  getRefreshToken(payload: JwtTOKEN): string {
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    return refreshToken;
  }
}
