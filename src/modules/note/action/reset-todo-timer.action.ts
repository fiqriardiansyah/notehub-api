import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { TodoDto } from 'src/models/todo.dto';

@Injectable()
export class ResetTodoTimerAction {
  constructor(private readonly prisma: PrismaService) {}

  // this action for debug only
  async execute(noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId },
    });

    const todos = note.todos.map((t) => JSON.parse(t)) as TodoDto[];

    const update = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        ...note,
        todos: todos?.map((t) =>
          JSON.stringify({ ...t, timer: null, attach: [] }),
        ),
      },
    });

    return {
      ...update,
      todos: update.todos.map((t) => JSON.parse(t)),
    };
  }
}
