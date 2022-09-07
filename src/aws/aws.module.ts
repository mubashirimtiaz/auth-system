import { Module } from '@nestjs/common';
import { SESV2 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { SesService } from './ses/ses.service';

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: process.env.AWS_REGION,
      },
      services: [SESV2],
    }),
  ],
  providers: [SesService],
  exports: [SesService],
})
export class AwsModule {}
