import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from './interface/user.interface';
import { ApiResponse } from 'src/common/interfaces';
import { MESSAGE } from 'src/common/messages';
import { USER_MESSAGE } from './message/user.message';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApiSuccessResponse,
  throwApiErrorResponse,
} from 'src/common/functions';
import {
  ForgetPasswordDTO,
  UpdateForgetPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/common/types';
import { SesService } from 'src/aws/ses/ses.service';
import { PASSWORD_CHANGE_TYPE } from './type/user.type';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly sesService: SesService,
  ) {}

  async updateProfile(
    profile: UpdateProfileDTO,
    payload: User,
  ): Promise<ApiResponse<User>> {
    try {
      if (!profile.name) {
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
          ...(profile.name && { name: profile.name }),
          updatedAt: new Date(),
        },
      });
      if (!user) {
        throwApiErrorResponse({
          response: {
            message: USER_MESSAGE.error.USER_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      return ApiSuccessResponse<User>(
        true,
        USER_MESSAGE.success.USER_UPDATED,
        user,
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
      return await this.passwordLookup(
        credential,
        user,
        PASSWORD_CHANGE_TYPE.UPDATE,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async forgetPassword({
    email,
  }: ForgetPasswordDTO): Promise<ApiResponse<Token>> {
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
            message: USER_MESSAGE.error.USER_INVALID_EMAIL,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };
      const hash =
        user.hash ??
        bcrypt.hashSync(
          user.email + user.hash,
          process.env.FORGET_PASSWORD_SALT,
        );

      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_FORGET_PASSWORD_SECRET + hash,
        expiresIn: process.env.JWT_FORGET_PASSWORD_EXPIRATION_TIME,
      });
      const url = `http://localhost:3000/v1/api/user/${payload?.sub}/forget-password?token=${token}`;
      await this.sesService.sendMail(
        payload?.email,
        {
          url,
          name: payload?.name,
        },
        'FUMA! Forget your password?',
        `<p>Hey ${payload?.name},</p>
        <h2>Forget Password?</h2>
        <p>Please click below to change your password</p>
        <p>
          <a href=${url}>Change Password</a>
        </p>

        <p>If you did not request this email you can safely ignore it.</p>`,
      );
      return ApiSuccessResponse<Token>(
        true,
        MESSAGE.mail.success.FORGET_PASSWORD_MAIL_SENT,
        { token },
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async updateForgetPassword(payload: UpdateForgetPasswordDTO, user) {
    try {
      return await this.passwordLookup(
        payload,
        user,
        PASSWORD_CHANGE_TYPE.FORGET,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async verifyEmail(user: User): Promise<ApiResponse<null>> {
    try {
      if (user?.emailVerified) {
        throwApiErrorResponse({
          response: {
            message: USER_MESSAGE.error.USER_EMAIL_ALREADY_VERIFIED,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      await this.prismaService.user.update({
        where: { email: user.email },
        data: {
          emailVerified: true,
          updatedAt: new Date(),
        },
      });

      return ApiSuccessResponse<null>(
        true,
        USER_MESSAGE.success.USER_EMAIL_VERIFIED,
        null,
      );
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
    type: PASSWORD_CHANGE_TYPE,
  ): Promise<ApiResponse<null>> {
    try {
      if (type === PASSWORD_CHANGE_TYPE.UPDATE) {
        if (!(await bcrypt.compare(credential.oldPassword, user.hash))) {
          throwApiErrorResponse({
            response: {
              message: USER_MESSAGE.error.USER_INVALID_PASSWORD,
              success: false,
            },
            status: HttpStatus.BAD_REQUEST,
          });
        }
        if (await bcrypt.compare(credential.newPassword, user.hash)) {
          throwApiErrorResponse({
            response: {
              message: USER_MESSAGE.error.USER_SAME_PASSWORD,
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
        USER_MESSAGE.success.USER_PASSWORD_UPDATED,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
