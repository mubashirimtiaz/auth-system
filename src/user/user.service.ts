import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/auth/interface/auth.interface';
import { ApiResponse } from 'src/common/interfaces';
import { MESSAGE } from 'src/common/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApiSuccessResponse,
  getRequiredProperties,
  throwApiErrorResponse,
} from 'src/common/functions';
import {
  ForgetPasswordDTO,
  UpdateForgetPasswordDTO,
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
    payload: User,
  ): Promise<ApiResponse<User>> {
    try {
      if (!profile.firstName && !profile.lastName) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.general.error.NO_DATA_FOUND,
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
            message: MESSAGE.user.error.USER_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      const result = getRequiredProperties(user, ['hash']) as Partial<User>;
      return ApiSuccessResponse<User>(
        true,
        MESSAGE.user.success.USER_UPDATED,
        result,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async updatePassword(
    credential: UpdatePasswordDTO,
    user: User,
  ): Promise<ApiResponse<null>> {
    try {
      return await this.passwordLookup(credential, user);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async forgetPassword({
    email,
  }: ForgetPasswordDTO): Promise<ApiResponse<null>> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          oAuthProviders: {
            select: {
              provider: true,
            },
          },
        },
      });

      if (!user) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.user.error.USER_INVALID_EMAIL,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      if (!user?.hash) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.user.error.USER_MISSING_PASSWORD,
            success: false,
            data: user?.oAuthProviders,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      const payload = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_FORGET_PASSWORD_SECRET + user.hash,
        expiresIn: process.env.JWT_FORGET_PASSWORD_EXPIRATION_TIME,
      });
      const url = `http://localhost:3000/v1/api/user/${payload?.sub}/forget-password?token=${token}`;
      await this.mailService.sendMail(payload?.email, {
        url,
        name: payload?.firstName,
      });
      return ApiSuccessResponse(true, MESSAGE.general.success.EMAIL_SENT);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async updateForgetPassword(payload: UpdateForgetPasswordDTO, user) {
    try {
      return await this.passwordLookup(payload, user);
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  private async passwordLookup(
    credential: {
      oldPassword?: string;
      newPassword: string;
    },
    user: User,
  ): Promise<ApiResponse<null>> {
    try {
      if (credential?.oldPassword) {
        if (!(await bcrypt.compare(credential.oldPassword, user.hash))) {
          throwApiErrorResponse({
            response: {
              message: MESSAGE.user.error.USER_INVALID_PASSWORD,
              success: false,
            },
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }

      if (await bcrypt.compare(credential.newPassword, user.hash)) {
        throwApiErrorResponse({
          response: {
            message: MESSAGE.user.error.USER_SAME_PASSWORD,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
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
        MESSAGE.user.success.USER_PASSWORD_UPDATED,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
