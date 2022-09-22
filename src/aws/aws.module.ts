import { Module } from '@nestjs/common';
import { SESV2, S3 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { SesService } from './ses/ses.service';
import { S3Service } from './s3/s3.service';

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: process.env.AWS_REGION,
      },
      services: [SESV2, S3],
    }),
  ],
  providers: [SesService, S3Service],
  exports: [SesService, S3Service],
})
export class AwsModule {}
