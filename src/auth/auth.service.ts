import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAUTH_PROVIDER } from '@prisma/client';
import { JwtTOKEN } from './interface/auth.interface';
import { User } from 'src/common/interfaces';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { StrategyType } from './enum/auth.enum';
import { AuthToken, UserValidationData } from './type/auth.type';
import {
  ApiSuccessResponse,
  throwApiErrorResponse,
} from 'src/common/functions';
import { ApiResponse } from 'src/common/interfaces';
import { AUTH_MESSAGE } from './message/auth.message';
import { MESSAGE } from 'src/common/messages';
import { Token } from 'src/common/types';
import { SesService } from 'src/aws/ses/ses.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private sesService: SesService,
    private configService: ConfigService,
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
      },
    );
  }

  async signup({
    email,
    password,
    name,
  }: SignUpDTO): Promise<ApiResponse<AuthToken | Token>> {
    try {
      const user = await this.validateUserWithOAuth({
        email,
        name,
        password,
        providerName: OAUTH_PROVIDER.EMAIL_PASSWORD,
      });
      const payload = { email: user.email, sub: user.id, name: user.name };
      if (!user?.emailVerified) {
        const token = this.jwtService.sign(payload, {
          secret: process.env.VERIFY_EMAIL_SECRET + user.email,
          expiresIn: process.env.VERIFY_EMAIL_EXPIRATION_TIME,
        });
        const url = `${this.configService.get('URL')}/v1/api/user/${
          user?.id
        }/verify-email?token=${token}`;
        await this.sesService.sendMail(
          user?.email,
          { name: user?.name, url },
          'FUMA! Verify Email',
          `<p>Hey ${user?.name},</p>
          <h2>Verify your email</h2>
          <p>Please click below to verify your email</p>
          <p>
            <a href=${url}>Verify EMAIL</a>
          </p>
          
          <p>If you did not request this email you can safely ignore it.</p>`,
        );
        return ApiSuccessResponse<Token>(
          true,
          MESSAGE.mail.success.VERIFY_EMAIL_MAIL_SENT,
          { token },
        );
      }

      const accessToken = await this.getAccessToken(payload);

      const refreshToken = await this.getRefreshToken(payload);

      return ApiSuccessResponse<AuthToken>(
        true,
        MESSAGE.user.success.USER_CREATED,
        {
          accessToken,
          refreshToken,
        },
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
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
      const user: User = await this.prismaService.user.findUnique({
        where: { email: payload.email },
        include: {
          oAuthProviders: {
            select: {
              provider: true,
            },
          },
        },
      });

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
            },
            status: HttpStatus.UNAUTHORIZED,
          });
        }

        if (!user?.hash) {
          const providers = user?.oAuthProviders?.map(
            (elem) => elem.provider,
          ) as string[];

          throwApiErrorResponse({
            response: {
              message: MESSAGE.user.error.USER_MISSING_PASSWORD(providers),
              success: false,
            },
            status: HttpStatus.UNAUTHORIZED,
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
            },
            status: HttpStatus.UNAUTHORIZED,
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
    name,
    picture,
    providerName,
    verified,
  }: UserValidationData): Promise<User> {
    try {
      const user: User = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          oAuthProviders: {
            select: {
              provider: true,
              userId: true,
            },
          },
        },
      });

      if (user) {
        const providerExists = user.oAuthProviders.find(
          (elem) => elem.userId === user.id && elem.provider === providerName,
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
        },
      });

      await this.prismaService.oAuthProvider.create({
        data: {
          userId: newUser.id,
          provider: providerName,
          providerId,
        },
      });
      return newUser;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  private getAccessToken(payload: Partial<JwtTOKEN>): string {
    const accessToken: string = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return accessToken;
  }

  private getRefreshToken(payload: Partial<JwtTOKEN>): string {
    const refreshToken: string = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    return refreshToken;
  }
}
