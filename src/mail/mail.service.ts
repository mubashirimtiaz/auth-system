import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(email: string, context: { [key: string]: string | number }) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'FUMA! Forget your password?',
      template: './forget-password',
      context,
    });
  }
}
