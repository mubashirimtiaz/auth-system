import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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
    const token = this.generateJWT({
      email: user.email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return token;
  }

  async signup({ email, password, firstName, lastName }) {
    const user = await this.validateUserWithOAuth({
      email,
      firstName,
      lastName,
      password,
      providerName: OAUTH_PROVIDER.EMAIL_PASSWORD,
    });

    const token = this.generateJWT({
      email: user.email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return token;
  }

  async validateUserWithCredentials(
    email: string,
    password: string,
  ): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });
    const isValidPassword = await bcrypt.compare(password, user.hash);
    if (user && isValidPassword) {
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
          // ...(picture && { picture }),
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

  private generateJWT(data) {
    return {
      access_token: this.jwtService.sign(data),
    };
  }
}
