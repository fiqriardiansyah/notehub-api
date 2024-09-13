import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Note, Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { Todo } from "src/model";
const dayjs = require('dayjs')

@Injectable()
export class HabitsSchedulerService {
    constructor(private prismaService: PrismaService) { }

    @Cron("59 23 * * *") // run 1 minute before midnight every day
    async rescheduleHabitDaily() {
        const notes = await this.getHabits("day");

        const habitsToReschedule: Note[] = [];
        const completedStatusMap: Record<string, boolean> = {};

        notes.forEach((note) => {
            const todos = this.parseTodos(note.todos);
            const allDone = todos.every((t) => t.isCheck);

            if (this.isScheduledForToday(note)) {
                habitsToReschedule.push(note);
                completedStatusMap[note.id] = allDone;
            }
        });

        if (habitsToReschedule.length) {
            await this.handleHabits(habitsToReschedule, completedStatusMap);
        }

        console.log("RESCHEDULER - DAILY HABIT");
    }

    @Cron("59 23 * * 6") // run 1 minute before midnight/00:00 sunday 
    async reschduleHabitWeekly() {
        const notes = await this.getHabits("weekly");

        const habitsToReschedule: Note[] = [];
        const completedStatusMap: Record<string, boolean> = {};

        notes.forEach((note) => {
            const todos = this.parseTodos(note.todos);
            const allDone = todos.every((t) => t.isCheck);

            habitsToReschedule.push(note);
            completedStatusMap[note.id] = allDone;
        });

        if (habitsToReschedule.length) {
            await this.handleHabits(habitsToReschedule, completedStatusMap);
        }

        console.log("RESCHEDULER - WEEKLY HABIT");
    }

    @Cron("59 23 28-31 * *") // run 1 minute before midnight of the last day of the month
    async reschduleHabitMonthly() {
        const notes = await this.getHabits("monthly");

        const habitsToReschedule: Note[] = [];
        const completedStatusMap: Record<string, boolean> = {};

        notes.forEach((note) => {
            const todos = this.parseTodos(note.todos);
            const allDone = todos.every((t) => t.isCheck);

            habitsToReschedule.push(note);
            completedStatusMap[note.id] = allDone;
        });

        if (habitsToReschedule.length) {
            await this.handleHabits(habitsToReschedule, completedStatusMap);
        }

        console.log("RESCHEDULER - MONTHLY HABIT");
    }

    private async getHabits(type: "day" | "weekly" | "monthly"): Promise<Note[]> {
        return this.prismaService.$queryRaw(Prisma.raw(`
            SELECT * FROM public.note n
            WHERE n.type = 'habits' AND n."schedulerType" = '${type}'
        `));
    }

    private parseTodos(todos: string[]): Todo[] {
        return todos.map((t) => JSON.parse(t)) as Todo[];
    }

    private isScheduledForToday(note: Note): boolean {
        const today = dayjs().format("dddd").toLowerCase();
        return note.schedulerDays.includes(today);
    }

    private async handleHabits(habits: Note[], completedStatusMap: Record<string, boolean>) {
        const updateRescheduleAndResetTodos = this.buildUpdateQuery(habits);
        const createHistory = this.prismaService.habitsHistory.createMany({
            data: habits.map((habit) => ({
                habitId: habit.id,
                userId: habit.userId,
                isCompleted: completedStatusMap[habit.id],
                todos: habit.todos,
            })),
        });

        await this.prismaService.$transaction([updateRescheduleAndResetTodos, createHistory]);
    }

    private buildUpdateQuery(habits: Note[]) {
        const cases = habits.map((n) => {
            const resetTodos = this.resetTodos(n.todos);
            return `WHEN id = '${n.id}' THEN ARRAY[${resetTodos}]::text[]` + "\n";
        }).join(' ');

        const habitIds = habits.map((n) => `'${n.id}'`).join(", ");
        return this.prismaService.$queryRaw(Prisma.raw(`
            UPDATE public.note
            SET reschedule = true, todos = CASE ${cases} END
            WHERE id IN (${habitIds});
        `));
    }

    private resetTodos(todos: string[]): string {
        return todos.map((t) => {
            const todo = JSON.parse(t) as Todo;
            return {
                ...todo,
                isCheck: false,
                checkedAt: null,
                timer: null,
            };
        }).map((t) => `'${JSON.stringify(t)}'`).join(", ");
    }
}