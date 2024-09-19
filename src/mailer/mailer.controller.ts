import { Body, Controller, Post } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) { }

  @Post("/send-invitation-collab")
  async sendInvitationCollab(@Body() body: Mail.Options) {
    const result = await this.mailerService.sendInvitationCollab(body);
    return {
      data: result,
    }
  }
}
