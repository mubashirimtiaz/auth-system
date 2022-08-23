import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAUTH_PROVIDER } from '@prisma/client';
import { JwtTOKEN } from './interface/auth.interface';
import { User } from 'src/common/interfaces';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { StrategyType } from './enum/auth.enum';
import { Token, UserValidationData } from './type/auth.type';
import {
  ApiSuccessResponse,
  throwApiErrorResponse,
} from 'src/common/functions';
import { ApiResponse } from 'src/common/interfaces';
import { AUTH_MESSAGE } from './message/auth.message';
import { MESSAGE } from 'src/common/messages';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(payload: User): Promise<ApiResponse<Token>> {
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

    return ApiSuccessResponse<Token>(
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
  }: SignUpDTO): Promise<ApiResponse<Token>> {
    try {
      const user = await this.validateUserWithOAuth({
        email,
        name,
        password,
        providerName: OAUTH_PROVIDER.EMAIL_PASSWORD,
      });

      const accessToken = await this.getAccessToken({
        email: user.email,
        sub: user.id,
        name: user.name,
      });

      const refreshToken = await this.getRefreshToken({
        email: user.email,
        sub: user.id,
        name: user.name,
      });

      return ApiSuccessResponse<Token>(
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

  async validateUser(
    payload: SignInDTO | JwtTOKEN,
    strategy: StrategyType,
  ): Promise<User> {
    try {
      const user: User = await this.prismaService.user.findUnique({
        where: { email: payload.email },
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

  refreshAccessToken(user: User): ApiResponse<Token> {
    const accessToken = this.getAccessToken({
      email: user.email,
      sub: user.id,
      name: user.name,
    });
    return ApiSuccessResponse<Token>(
      true,
      AUTH_MESSAGE.success.REFRESH_TOKEN_VERIFIED,
      {
        accessToken,
      },
    );
  }

  async validateUserWithOAuth({
    email,
    password = null,
    providerId = null,
    name,
    picture,
    providerName,
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
