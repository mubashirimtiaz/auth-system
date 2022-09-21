import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse, User } from 'src/common/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDTO, UpdateServiceDTO } from './dto/service.dto';
import { v4 as uuid } from 'uuid';
import {
  ApiSuccessResponse,
  throwApiErrorResponse,
} from 'src/common/functions';
import { SERVICE_MESSAGE } from './message/service.message';
import { MESSAGE } from 'src/common/messages';
import { Service } from './interface/service.interface';

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}
  async createService(
    user: User,
    param: CreateServiceDTO,
  ): Promise<ApiResponse<Service>> {
    try {
      const organization = await this.prismaService.organization.findUnique({
        where: { ownerId: user.id },
      });

      if (!organization) {
        throwApiErrorResponse({
          response: {
            message: 'Organization not found, please create organization first',
            success: false,
          },
          status: HttpStatus.NOT_FOUND,
        });
      }

      const service = await this.prismaService.service.create({
        data: {
          clientId: uuid(),
          proxyPath: param.proxyPath,
          proxyServerUrl: param.proxyServerUrl,
          name: param.name,
          organizationId: organization.id,
          userId: user.id,
        },
      });

      return ApiSuccessResponse<Service>(
        true,
        SERVICE_MESSAGE.success.SERVICE_CREATED,
        service,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async updateService(
    user: User,
    param: UpdateServiceDTO,
    serviceId: string,
  ): Promise<ApiResponse<Service>> {
    if (!Object.keys(param).length) {
      throwApiErrorResponse({
        response: {
          message: MESSAGE.general.error.NO_DATA_FOUND,
          success: false,
        },
        status: HttpStatus.BAD_REQUEST,
      });
    }
    try {
      const service = await this.prismaService.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throwApiErrorResponse({
          response: {
            message: SERVICE_MESSAGE.error.SERVICE_NOT_FOUND,
            success: false,
          },
          status: HttpStatus.NOT_FOUND,
        });
      }
      const updatedService = await this.prismaService.service.update({
        where: { id: serviceId },
        data: {
          ...param,
          updatedAt: new Date(),
        },
      });

      return ApiSuccessResponse<Service>(
        true,
        SERVICE_MESSAGE.success.SERVICE_UPDATED,
        updatedService,
      );
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
