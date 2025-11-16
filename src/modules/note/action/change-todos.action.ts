import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { ChangeTodosDto } from '../dto';

@Injectable()
export class ChangeTodosAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, payload: ChangeTodosDto) {
    const note = (
      await this.prisma.$queryRaw(
        Prisma.raw(`
            select n.* from public.note n left join public.collaboration c on n.id = c."noteId" 
            where n.id = '${payload.noteId}' and 
            (n."userId" = '${user.id}' or c."userId" = '${user.id}')
        `),
      )
    )[0] as { id: string };

    if (!note) {
      throw new HttpException("Can't find note!", HttpStatus.NOT_FOUND);
    }

    const update = await this.prisma.note.update({
      where: {
        id: payload.noteId,
      },
      data: {
        todos: payload.todos.map((t) => JSON.stringify(t)),
        updatedBy: user.name,
      },
    });

    return {
      ...update,
      todos: update.todos.map((t) => JSON.parse(t)),
    };
  }
}
