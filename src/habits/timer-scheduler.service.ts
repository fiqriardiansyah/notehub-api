import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Note, Notification } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { TodoDto } from 'src/models/todo.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TimerSchedulerService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async rescheduleHabitDaily() {
    const timers = await this.prismaService.timer.findMany({
      where: {
        endTime: {
          lte: new Date().toISOString(),
        },
      },
    });

    if (!timers.length) return;

    const deleteTimers = await this.prismaService.timer.deleteMany({
      where: {
        id: {
          in: timers.map((t) => t.id),
        },
      },
    });

    const notes = await this.prismaService.note.findMany({
      where: {
        id: {
          in: timers.map((t) => t.noteId),
        },
      },
    });

    const notifications: { todo: TodoDto; note: Note }[] = [];

    notes?.forEach(async (n) => {
      const newTodos = n.todos?.map((t) => {
        const todo = JSON.parse(t) as TodoDto;
        const timer = timers.find(
          (timer) => n.id === timer.noteId && timer.itemId === todo.id,
        );

        if (timer) {
          notifications.push({ todo, note: n });
          return {
            ...todo,
            isCheck: timer?.autoComplete ? true : todo?.isCheck,
            checkedAt: timer?.autoComplete
              ? new Date(timer?.endTime).getTime()
              : todo?.checkedAt,
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
        },
      });
    });

    if (notifications.length) {
      await this.notificationService.createNotification(
        notifications.map((item) => ({
          type: this.notificationService.TYPE_TIMER_HABITS,
          content: JSON.parse(
            JSON.stringify({
              title: 'Times up!',
              description: `Your Timer at task <b>${item.todo.content}</b> has over`,
              noteId: item.note.id,
            }),
          ),
          userId: item.note.userId,
        })) as Notification[],
      );
    }
  }
}
