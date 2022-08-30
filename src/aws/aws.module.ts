import { Module } from '@nestjs/common';
import { SESV2 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { SesService } from './ses/ses.service';

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
      services: [SESV2],
    }),
  ],
  providers: [SesService],
  exports: [SesService],
})
export class AwsModule {}
