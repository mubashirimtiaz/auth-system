import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAUTH_PROVIDER } from '@prisma/client';
import { JwtTOKEN, User, UserPayload } from './interface/auth.interface';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { StrategyType } from './enum/auth.enum';
import { Token, UserValidationData } from './type/auth.type';
import { apiResponseHandler } from 'src/utils/functions';
import { ApiResponse } from 'src/interfaces/global.interface';
import { AUTH_MESSAGE } from './message/auth.message';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(payload: UserPayload): Promise<ApiResponse<Token>> {
    const accessToken = this.getAccessToken({
      email: payload.email,
      sub: payload.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    const refreshToken = this.getRefreshToken({
      email: payload.email,
      sub: payload.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });

    return apiResponseHandler<Token>(
      true,
      AUTH_MESSAGE.success.USER_LOGGED_IN,
      {
        accessToken,
        refreshToken,
      },
    );
  }

  async signup({
    email,
    password,
    firstName,
    lastName,
  }: SignUpDTO): Promise<ApiResponse<Token>> {
    const user = await this.validateUserWithOAuth({
      email,
      firstName,
      lastName,
      password,
      providerName: OAUTH_PROVIDER.EMAIL_PASSWORD,
    });

    const accessToken = await this.getAccessToken({
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const refreshToken = await this.getRefreshToken({
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return apiResponseHandler<Token>(true, AUTH_MESSAGE.success.USER_CREATED, {
      accessToken,
      refreshToken,
    });
  }

  refreshAccessToken(payload: { user: UserPayload }): ApiResponse<Token> {
    const accessToken: string = this.jwtService.sign(payload.user, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return apiResponseHandler<Token>(
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
      });

      if (user && strategy === StrategyType.JWT) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hash: _, ...result } = user;
        return result;
      }

      if (
        user &&
        'password' in payload &&
        strategy === StrategyType.LOCAL &&
        (await bcrypt.compare(payload.password, user.hash))
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hash: _, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validateUserWithOAuth({
    email,
    password = null,
    providerId = null,
    lastName,
    firstName,
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
            throw new ConflictException(AUTH_MESSAGE.error.USER_ALREADY_EXISTS);
          }
          return user;
        }
        const updatedUser = await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            ...(password && { hash: password }),
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
          firstName,
          lastName,
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
      throw new InternalServerErrorException();
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
