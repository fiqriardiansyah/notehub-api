import { Module } from "@nestjs/common";
import { HabitsService } from "./habits.service";
import { HabitsController } from "./habits.controller";
import { HabitsSchedulerService } from "./habits-scheduler.service";
import { TimerSchedulerService } from "./timer-scheduler.service";

@Module({
    controllers: [HabitsController],
    providers: [HabitsService, HabitsSchedulerService, TimerSchedulerService]
})
export class HabitsModule { }