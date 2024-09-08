import { Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { HabitsService } from "./habits.service";

@Controller("/habits")
export class HabitsController {
    constructor(private habitsService: HabitsService) { }

    @Get("/urgent")
    async getUrgentHabit(@Auth() user: User, @Query("limit") limit: number) {
        const result = await this.habitsService.getUrgentHabit(user, limit);
        return {
            data: result
        }
    }

    @Get("/:type")
    async getHabits(@Auth() user: User, @Param("type") type: string) {
        const types = ["all", "day", "weekly", "monthly"];
        if (!types.includes(type)) {
            throw new HttpException("Type habits required!", HttpStatus.BAD_GATEWAY);
        }
        const result = await this.habitsService.getHabits(user, type);
        return {
            data: result,
        }
    }

    @Get("/finish/:id")
    async finishHabits(@Auth() user: User, @Param("id") id: string) {
        const result = await this.habitsService.finishHabits(user, id);
        return {
            data: result
        }
    }

    @Get("/history/:id")
    async getHabitHistory(@Auth() user: User, @Param("id") id?: string) {
        const result = await this.habitsService.getHabitHistory(user, id);
        return {
            data: result,
        }
    }
}