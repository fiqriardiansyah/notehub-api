import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { parsingNotes } from 'src/lib/utils';

@Injectable()
export class GetNotesAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    user,
    folderId = null,
    order = 'desc',
  }: {
    user: User;
    folderId?: string;
    order?: 'desc' | 'asc';
  }) {
    let queryString = `
                select * from public.note n 
                where n."userId" = '${user.id}' 
                ${folderId ? `and n."folderId" = '${folderId}'` : 'and n."folderId" is null'} 
                and n."type" != 'habits'
                order by 
                    case when n."isHang" = true then 0 else 1 end,
                    n."updatedAt" ${order};
            `;

    const notes = (await this.prisma.$queryRaw(
      Prisma.raw(queryString),
    )) as Note[];

    return parsingNotes(notes);
  }
}
