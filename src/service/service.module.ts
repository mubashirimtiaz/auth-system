import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
