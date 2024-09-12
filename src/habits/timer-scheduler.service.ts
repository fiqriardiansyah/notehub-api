import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/common/prisma.service";
import { Todo } from "src/note/note.models";

@Injectable()
export class TimerSchedulerService {
    constructor(private prismaService: PrismaService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async rescheduleHabitDaily() {
        const timers = await this.prismaService.timer.findMany({
            where: {
                endTime: {
                    lte: new Date().toISOString()
                }
            }
        });

        if (!timers.length) return;

        const deleteTimers = await this.prismaService.timer.deleteMany({
            where: {
                id: {
                    in: timers.map((t) => t.id),
                }
            }
        });

        const notes = await this.prismaService.note.findMany({
            where: {
                id: {
                    in: timers.map((t) => t.noteId),
                }
            },
        });

        notes?.forEach(async (n) => {
            const newTodos = n.todos?.map((t) => {
                const todo = JSON.parse(t) as Todo;
                const timer = timers.find((timer) => n.id === timer.noteId && timer.itemId === todo.id);
                if (timer) {
                    return {
                        ...todo,
                        isCheck: timer?.autoComplete ? true : todo?.isCheck,
                        checkedAt: timer?.autoComplete ? new Date(timer?.endTime).getTime() : todo?.checkedAt,
                        timer: null,
                    };
                }
                return todo;
            });

            this.prismaService.note.update({
                where: {
                    id: n.id,
                },
                data: {
                    todos: newTodos?.map((t) => JSON.stringify(t)),
                }
            })
        });
    }
}