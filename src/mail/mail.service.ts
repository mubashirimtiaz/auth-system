import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(
    email: string,
    context: { [key: string]: string | number },
    subject: string,
    template: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context,
    });
  }
}
