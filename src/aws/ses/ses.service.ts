import { Injectable } from '@nestjs/common';
import { SESV2 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';
import { throwApiErrorResponse } from 'src/common/functions';

@Injectable()
export class SesService {
  constructor(@InjectAwsService(SESV2) private readonly ses: SESV2) {}
  async sendMail(
    email: string,
    context: { [key: string]: string | number },
    subject: string,
    template: string,
  ) {
    const params = {
      Content: {
        Simple: {
          Body: {
            Html: {
              Data: template,
            },
          },
          Subject: {
            Data: subject,
          },
        },
        // Template: {}
      },
      Destination: {
        ToAddresses: [email],
      },
      // FromEmailAddress: 'no-reply@fuma.ai',
      FromEmailAddress: 'mubashir@sudofy.com',
    };
    try {
      await this.ses.sendEmail(params).promise();
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
