import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/common/interfaces';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      // if (['update'].includes(params.action) && params.args.data.updatedAt) {
      //   const data = params.args.data;
      //   data.updatedAt = new Date();
      //   params.args.data = data;
      // }

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
      return next(params);
    });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
