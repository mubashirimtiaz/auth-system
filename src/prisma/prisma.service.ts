import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Service } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { S3Service } from 'src/aws/s3/s3.service';
import {
  getRequiredProperties,
  throwApiErrorResponse,
} from 'src/common/functions';
import { User } from 'src/common/interfaces';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly s3Service: S3Service) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      if (
        ['create', 'update'].includes(params.action) &&
        params.model == 'User' &&
        params.args.data.hash
      ) {
        const user: User = params.args.data;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.hash, salt);
        user.hash = hash;
        params.args.data = user;
      }
      if (
        ['create', 'update', 'delete'].includes(params.action) &&
        params.model == 'Service'
      ) {
        try {
          const result = await next(params);
          const services: Service[] = await this.service.findMany();
          const service = {};
          services.forEach((svc) => {
            const data = getRequiredProperties(svc, [
              'name',
              'proxyPath',
              'proxyServerUrl',
              'organizationId',
            ]);
            service[svc.clientId] = data;
          });
          await this.s3Service.uploadFile(
            'fuma-services-test',
            'services.json',
            Buffer.from(JSON.stringify(service)),
          );
          return result;
        } catch (error) {
          throwApiErrorResponse(error);
        }
      }
      return next(params);
    });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
