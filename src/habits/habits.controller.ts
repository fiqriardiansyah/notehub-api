import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { Timer, User } from "@prisma/client";
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

    @Get("/running-timer")
    async getRunningTimer(@Auth() user: User) {
        const result = await this.habitsService.getRunningTimer(user);
        return {
            data: result,
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

    @Post("/timer")
    async setTimerTask(@Auth() user: User, @Body() timer: Partial<Timer>) {
        const result = await this.habitsService.setTimerTask(timer);
        return {
            data: result,
        }
    }

    @Delete("/timer/:noteId/:itemId")
    async deleteTimerTask(@Auth() user: User, @Param() params: { noteId: string, itemId: string }) {
        const result = await this.habitsService.deleteTimerTask(params.itemId, params.noteId);
        return {
            data: result,
        }
    }

    @Get("/timer/zen")
    async getTimerZenMode(@Auth() user: User) {
        const result = await this.habitsService.getTimerZenMode(user);
        return {
            data: result,
        }
    }

    @Post("/timer/zen/:id")
    async setZenMode(@Auth() user: User, @Param("id") id: string, @Body() body: { status: boolean }) {
        const result = await this.habitsService.setZenMode(id, body.status);
        return {
            data: result,
        }
    }
}