import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [AwsModule],
})
export class PrismaModule {}
