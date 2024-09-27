import { Module } from "@nestjs/common";
import { CollaborationService } from "./collaboration.service";
import { CollaborationController } from "./collaboration.controller";
import { MailerService } from "src/mailer/mailer.service";
import { MailerTemplateService } from "src/mailer/mailer.template.service";
import { NotificationService } from "src/notification/notification.service";

@Module({
    providers: [CollaborationService, MailerService, MailerTemplateService, NotificationService],
    controllers: [CollaborationController]
})
export class CollaborationModule { }