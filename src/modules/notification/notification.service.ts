import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  readonly TYPE_TIMER_HABITS = 'notification-timer-habits';
  readonly TYPE_INVITE_TO_PROJECT = 'notification-invite-to-project';
  readonly TYPE_LEAVE_PROJECT = 'notification-leave-project';
}
