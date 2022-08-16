import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAUTH_PROVIDER } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(user: any) {
    const accessToken = this.getAccessToken({
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const refreshToken = this.getRefreshToken({
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { accessToken, refreshToken };
  }

  async signup({ email, password, firstName, lastName }) {
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

    return { accessToken, refreshToken };
  }

  async validateUser(payload, strategy: string): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { email: payload.email, id: payload.id },
    });

    if (user && strategy === 'jwt') {
      const { hash, ...result } = user;
      return result;
    }

    if (
      user &&
      strategy === 'local' &&
      (await bcrypt.compare(payload.password, user.hash))
    ) {
      const { hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserWithOAuth({
    email,
    password = null,
    providerId = null,
    lastName,
    firstName,
    picture,
    providerName,
  }: {
    email: string;
    password?: string | null;
    providerId?: string | null;
    lastName: string;
    firstName: string;
    picture?: string | null;
    providerName: OAUTH_PROVIDER;
  }): Promise<any> {
    const user = await this.prismaService.user.findUnique({
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
          throw new ConflictException('User already exists');
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
  }

  refreshAccessToken(payload) {
    const accessToken = this.jwtService.sign(payload.user, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return { accessToken };
  }

  private getAccessToken(payload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return accessToken;
  }

  private getRefreshToken(payload) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    return refreshToken;
  }
}
