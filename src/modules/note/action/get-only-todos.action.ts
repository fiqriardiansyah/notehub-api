import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetOnlyTodosAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, noteId: string) {
    const notes = (
      await this.prisma.$queryRaw(
        Prisma.raw(`
            select n.* from public.note n left join public.collaboration c on n."id" = c."noteId"
            where n."id" = '${noteId}' and (n."userId" = '${user.id}' or c."userId" = '${user.id}')
        `),
      )
    )[0] as Note;
    return {
      todos: notes?.todos?.map((t) => JSON.parse(t)),
    };
  }
}
