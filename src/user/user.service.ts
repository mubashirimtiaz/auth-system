import { HttpStatus, Injectable } from '@nestjs/common';
import { UserPayload } from 'src/auth/interface/auth.interface';
import { AUTH_MESSAGE } from 'src/auth/message/auth.message';
import { ApiErrorResponse } from 'src/classes/global.class';
import { ApiResponse } from 'src/interfaces/global.interface';
import { GLOBAL_MESSAGE } from 'src/messages/global.message';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApiSuccessResponse,
  getRequiredProperties,
  throwApiErrorResponse,
} from 'src/utils/functions';
import {
  ForgetPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async updateProfile(
    profile: UpdateProfileDTO,
    payload: UserPayload,
  ): Promise<ApiResponse<UserPayload>> {
    try {
      if (!profile.firstName && !profile.lastName) {
        throwApiErrorResponse({
          response: {
            message: GLOBAL_MESSAGE.error.NO_DATA_FOUND,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      const user = await this.prismaService.user.update({
        where: { email: payload?.email },
        data: {
          ...(profile.firstName && { firstName: profile.firstName }),
          ...(profile.lastName && { lastName: profile.lastName }),
          updatedAt: new Date(),
        },
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
      const result = getRequiredProperties(user, [
        'hash',
        'createdAt',
        'updatedAt',
      ]) as UserPayload;
      return ApiSuccessResponse<UserPayload>(
        true,
        AUTH_MESSAGE.success.USER_UPDATED,
        result,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async updatePassword(
    credential: UpdatePasswordDTO,
    payload: UserPayload,
  ): Promise<ApiResponse<null>> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: payload?.email },
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
      return await this.passwordLookup(credential, user);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async forgetPassword(payload: ForgetPasswordDTO): Promise<ApiResponse<null>> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
        include: {
          oAuthProviders: {
            take: 1,
            select: {
              provider: true,
            },
          },
        },
      });

      if (!user) {
        throwApiErrorResponse({
          response: {
            message: AUTH_MESSAGE.error.USER_INVALID_EMAIL,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      if (!user?.hash) {
        throwApiErrorResponse({
          response: {
            message: AUTH_MESSAGE.error.USER_MISSING_PASSWORD,
            success: false,
            data: user?.oAuthProviders?.[0],
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_FORGET_PASSWORD_SECRET,
        expiresIn: process.env.JWT_FORGET_PASSWORD_EXPIRATION_TIME,
      });

      await this.mailService.sendMail(
        { email: user?.email, firstName: user?.firstName },
        token,
      );
      return ApiSuccessResponse(true, AUTH_MESSAGE.success.EMAIL_SENT);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  private async passwordLookup(
    credential: {
      oldPassword?: string;
      newPassword: string;
    },
    user: { hash: string; email: string },
  ): Promise<ApiResponse<null>> {
    try {
      if (credential?.oldPassword) {
        if (!(await bcrypt.compare(credential.oldPassword, user.hash))) {
          throwApiErrorResponse({
            response: {
              message: AUTH_MESSAGE.error.USER_INVALID_PASSWORD,
              success: false,
            },
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }
      await this.prismaService.user.update({
        where: { email: user?.email },
        data: {
          hash: credential.newPassword,
          updatedAt: new Date(),
        },
      });

      return ApiSuccessResponse(
        true,
        AUTH_MESSAGE.success.USER_PASSWORD_UPDATED,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
