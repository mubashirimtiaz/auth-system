import { HttpStatus, Injectable } from '@nestjs/common';
import { UserPayload } from 'src/auth/interface/auth.interface';
import { AUTH_MESSAGE } from 'src/auth/message/auth.message';
import { ApiErrorResponse } from 'src/classes/global.class';
import { ApiResponse } from 'src/interfaces/global.interface';
import { GLOBAL_MESSAGE } from 'src/messages/global.message';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiSuccessResponse, getRequiredProperties } from 'src/utils/functions';
import { UpdateProfileDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateProfile(
    profile: UpdateProfileDTO,
    payload: UserPayload,
  ): Promise<ApiResponse<UserPayload>> {
    try {
      if (!profile.firstName && !profile.lastName) {
        throw new ApiErrorResponse(
          { message: GLOBAL_MESSAGE.error.NO_DATA_FOUND, success: false },
          HttpStatus.BAD_REQUEST,
        );
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
        throw new ApiErrorResponse(
          { message: AUTH_MESSAGE.error.USER_NOT_FOUND, success: false },
          HttpStatus.UNAUTHORIZED,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      throw new ApiErrorResponse(
        {
          message:
            error?.response?.message ||
            GLOBAL_MESSAGE.error.INTERNAL_SERVER_ERROR,
          success: error?.response?.success || false,
        },
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
