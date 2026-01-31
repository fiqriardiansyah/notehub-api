import { Module } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { MailerService } from 'src/mailer/mailer.service';
import { MailerTemplateService } from 'src/mailer/mailer.template.service';
import { NotificationModule } from 'src/modules/notification/notifiication.module';
import { NotificationService } from 'src/modules/notification/notification.service';

@Module({
  providers: [
    CollaborationService,
    MailerService,
    MailerTemplateService,
    NotificationService,
  ],
  controllers: [CollaborationController],
  imports: [NotificationModule],
})
export class CollaborationModule {}
