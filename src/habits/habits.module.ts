import { Module } from "@nestjs/common";
import { HabitsService } from "./habits.service";
import { HabitsController } from "./habits.controller";
import { HabitsSchedulerService } from "./habits-scheduler.service";
import { TimerSchedulerService } from "./timer-scheduler.service";
import { NotificationService } from "src/notification/notification.service";

@Module({
    controllers: [HabitsController],
    providers: [HabitsService, HabitsSchedulerService, TimerSchedulerService, NotificationService]
})
export class HabitsModule { }