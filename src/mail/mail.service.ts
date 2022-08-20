import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(user, token: string) {
    const url = `http://localhost:3000/v1/api/user/forget-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'FUMA! Forget your password?',
      template: './forget-password',
      context: {
        name: user.firstName,
        url,
      },
    });
  }
}
