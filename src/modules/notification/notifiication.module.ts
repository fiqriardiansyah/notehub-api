import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import {
  CountUnreadNotificationAction,
  CreateNotificationAction,
  DeleteNotificationAction,
  GetAllNotificationAction,
  ReadNotificationAction,
  UpdateInvitationProjectStatusAction,
} from './action';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    CountUnreadNotificationAction,
    CreateNotificationAction,
    ReadNotificationAction,
    DeleteNotificationAction,
    GetAllNotificationAction,
    UpdateInvitationProjectStatusAction,
  ],
  exports: [
    NotificationService,
    CreateNotificationAction,
    UpdateInvitationProjectStatusAction,
  ],
})
export class NotificationModule {}
