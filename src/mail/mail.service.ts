import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { throwApiErrorResponse } from 'src/common/functions';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(
    email: string,
    context: { [key: string]: string | number },
    subject: string,
    template: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template,
        context,
      });
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
