import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Note, Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { Todo } from "src/model";
const dayjs = require('dayjs')

@Injectable()
export class HabitsSchedulerService {
    constructor(private prismaService: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async rescheduleHabitDaily() {
        const notesHabit = await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.note n
            where n.type = 'habits' and n."schedulerType" = 'day'
        `)) as Note[];

        const rescheduleHabits: Note[] = [];
        const notFinishHabits: Note[] = [];

        notesHabit.forEach((note) => {
            const todos = note.todos.map((t) => JSON.parse(t)) as Todo[];
            const allDone = todos.filter((t) => t.isCheck).length === todos.length;

            if (allDone || !note.reschedule) {
                const today = dayjs().format("dddd").toLowerCase();
                if (note.schedulerDays.includes(today)) {
                    rescheduleHabits.push(note);
                }
                return;
            }
            notFinishHabits.push(note);
        });

        if (rescheduleHabits.length) {
            const updateRescheduleAndResetTodos = this.prismaService.$queryRaw(Prisma.raw(`
                    UPDATE public.note 
                        SET reschedule = true, 
                            todos = 
                            case
                                ${rescheduleHabits.map((n) => {
                const resetTodos = n.todos.map((t) => {
                    const todo = JSON.parse(t) as Todo;
                    return {
                        ...todo,
                        isCheck: false,
                        checkedAt: null,
                    };
                }).map((t) => `'${JSON.stringify(t)}'`).join(", ");
                return `WHEN id = '${n.id}' THEN ARRAY[${resetTodos}]::text[]` + '\n'
            }).join(' ')}
                                end
                    WHERE id IN (${rescheduleHabits.map((n) => `'${n.id}'`).join(", ")});
            `));

            const createHistory = this.prismaService.habitsHistory.createMany({
                data: rescheduleHabits.map((habit) => ({
                    habitId: habit.id,
                    userId: habit.userId,
                    isCompleted: true,
                    todos: habit.todos,
                }))
            });

            await this.prismaService.$transaction([updateRescheduleAndResetTodos, createHistory]);
        }

        if (notFinishHabits.length) {
            await this.prismaService.habitsHistory.createMany({
                data: notFinishHabits.map((habit) => ({
                    habitId: habit.id,
                    userId: habit.userId,
                    isCompleted: false,
                    todos: habit.todos,
                }))
            });
        }
        console.log("RESCHEDULER - DAILY HABIT")
    }

    @Cron(CronExpression.EVERY_WEEK)
    async reschduleHabitWeekly() {
        const notesHabit = await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.note n
            where n.type = 'habits' and n."schedulerType" = 'weekly'
        `)) as Note[];

        const rescheduleHabits: Note[] = [];
        const notFinishHabits: Note[] = [];

        notesHabit.forEach((note) => {
            const todos = note.todos.map((t) => JSON.parse(t)) as Todo[];
            const allDone = todos.filter((t) => t.isCheck).length === todos.length;

            if (allDone || !note.reschedule) {
                rescheduleHabits.push(note);
                return;
            }
            notFinishHabits.push(note);
        });

        if (rescheduleHabits.length) {
            const updateRescheduleAndResetTodos = this.prismaService.$queryRaw(Prisma.raw(`
                UPDATE public.note 
                    SET reschedule = true, 
                        todos = 
                        case
                            ${rescheduleHabits.map((n) => {
                const resetTodos = n.todos.map((t) => {
                    const todo = JSON.parse(t) as Todo;
                    return {
                        ...todo,
                        isCheck: false,
                        checkedAt: null,
                    };
                }).map((t) => `'${JSON.stringify(t)}'`).join(", ");
                return `WHEN id = '${n.id}' THEN ARRAY[${resetTodos}]::text[]` + '\n'
            }).join(' ')}
                            end
                WHERE id IN (${rescheduleHabits.map((n) => `'${n.id}'`).join(", ")});
        `));

            const createHistory = this.prismaService.habitsHistory.createMany({
                data: rescheduleHabits.map((habit) => ({
                    habitId: habit.id,
                    userId: habit.userId,
                    isCompleted: true,
                    todos: habit.todos,
                }))
            });

            await this.prismaService.$transaction([updateRescheduleAndResetTodos, createHistory]);
        }

        if (notFinishHabits.length) {
            await this.prismaService.habitsHistory.createMany({
                data: rescheduleHabits.map((habit) => ({
                    habitId: habit.id,
                    userId: habit.userId,
                    isCompleted: false,
                    todos: habit.todos,
                }))
            });
        }
    }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async reschduleHabitMonthly() {
        const notesHabit = await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.note n
            where n.type = 'habits' and n."schedulerType" = 'monthly'
        `)) as Note[];

        const rescheduleHabits: Note[] = [];
        const notFinishHabits: Note[] = [];

        notesHabit.forEach((note) => {
            const todos = note.todos.map((t) => JSON.parse(t)) as Todo[];
            const allDone = todos.filter((t) => t.isCheck).length === todos.length;

            if (allDone || !note.reschedule) {
                rescheduleHabits.push(note);
                return;
            }
            notFinishHabits.push(note);
        });

        if (rescheduleHabits.length) {
            const updateRescheduleAndResetTodos = this.prismaService.$queryRaw(Prisma.raw(`
                UPDATE public.note 
                    SET reschedule = true, 
                        todos = 
                        case
                            ${rescheduleHabits.map((n) => {
                const resetTodos = n.todos.map((t) => {
                    const todo = JSON.parse(t) as Todo;
                    return {
                        ...todo,
                        isCheck: false,
                        checkedAt: null,
                    };
                }).map((t) => `'${JSON.stringify(t)}'`).join(", ");
                return `WHEN id = '${n.id}' THEN ARRAY[${resetTodos}]::text[]` + '\n'
            }).join(' ')}
                            end
                WHERE id IN (${rescheduleHabits.map((n) => `'${n.id}'`).join(", ")});
        `));

            const createHistory = this.prismaService.habitsHistory.createMany({
                data: rescheduleHabits.map((habit) => ({
                    habitId: habit.id,
                    userId: habit.userId,
                    isCompleted: true,
                    todos: habit.todos,
                }))
            });

            await this.prismaService.$transaction([updateRescheduleAndResetTodos, createHistory]);
        }

        if (notFinishHabits.length) {
            await this.prismaService.habitsHistory.createMany({
                data: rescheduleHabits.map((habit) => ({
                    habitId: habit.id,
                    userId: habit.userId,
                    isCompleted: false,
                    todos: habit.todos,
                }))
            });
        }
    }
}