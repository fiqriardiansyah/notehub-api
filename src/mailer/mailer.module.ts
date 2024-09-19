import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { MailerTemplateService } from './mailer.template.service';

@Module({
  controllers: [MailerController],
  providers: [MailerService, MailerTemplateService],
})
export class MailerModule { }
