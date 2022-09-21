import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ApiSuccessResponse,
  throwApiErrorResponse,
} from 'src/common/functions';
import { ApiResponse, User } from 'src/common/interfaces';
import { MESSAGE } from 'src/common/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from './dto/organization.dto';
import { Organization } from './interface/organization.interface';
import { ORGANIZATION_MESSAGE } from './message/organization.message';

@Injectable()
export class OrganizationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrganization(user: User): Promise<ApiResponse<Organization>> {
    try {
      const organization = await this.prismaService.organization.findUnique({
        where: { ownerId: user.id },
      });

      if (!organization) {
        throwApiErrorResponse({
          response: {
            message: ORGANIZATION_MESSAGE.error.ORGANIZATION_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.NOT_FOUND,
        });
      }

      return ApiSuccessResponse<Organization>(
        true,
        ORGANIZATION_MESSAGE.success.ORGANIZATION_FOUND,
        organization,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async createOrganization(
    user: User,
    body: CreateOrganizationDTO,
  ): Promise<ApiResponse<Organization>> {
    try {
      const organization = await this.prismaService.organization.findUnique({
        where: { ownerId: user.id },
      });

      if (organization) {
        throwApiErrorResponse({
          response: {
            message: ORGANIZATION_MESSAGE.error.ORGANIZATION_ALREADY_EXISTS,
            success: false,
          },
          status: HttpStatus.BAD_REQUEST,
        });
      }
      const newOrganization = await this.prismaService.organization.create({
        data: {
          ...body,
          ownerId: user.id,
        },
      });
      return ApiSuccessResponse<Organization>(
        true,
        ORGANIZATION_MESSAGE.success.ORGANIZATION_CREATED,
        newOrganization,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async updateOrganization(
    user: User,
    body: UpdateOrganizationDTO,
    id: string,
  ): Promise<ApiResponse<Organization>> {
    if (!Object.keys(body).length) {
      throwApiErrorResponse({
        response: {
          message: MESSAGE.general.error.NO_DATA_FOUND,
          success: false,
        },
        status: HttpStatus.BAD_REQUEST,
      });
    }
    try {
      const organization = await this.prismaService.organization.findUnique({
        where: { id },
      });
      if (!organization) {
        throwApiErrorResponse({
          response: {
            message: ORGANIZATION_MESSAGE.error.ORGANIZATION_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.NOT_FOUND,
        });
      }
      const updatedOrganization = await this.prismaService.organization.update({
        where: { id },
        data: {
          ...body,
          updatedAt: new Date(),
        },
      });
      return ApiSuccessResponse<Organization>(
        true,
        ORGANIZATION_MESSAGE.success.ORGANIZATION_UPDATED,
        updatedOrganization,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
