import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { HabitsSchedulerService } from './habits-scheduler.service';
import { TimerSchedulerService } from './timer-scheduler.service';
import { NotificationModule } from 'src/modules/notification/notifiication.module';
import { NotificationService } from 'src/modules/notification/notification.service';

@Module({
  controllers: [HabitsController],
  providers: [
    HabitsService,
    HabitsSchedulerService,
    TimerSchedulerService,
    NotificationService,
  ],
  imports: [NotificationModule],
})
export class HabitsModule {}
