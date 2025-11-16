import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetNoteDetailAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, id: string) {
    type Return = Note & { folderName?: string; role: string };

    let result;

    if (id === 'insight') {
      result = await this.prisma.note.findFirst({
        where: { id },
        select: {
          note: true,
          imagesUrl: true,
          title: true,
          todos: true,
          filesUrl: true,
          description: true,
          tags: true,
        },
      });
    } else {
      result = (
        await this.prisma.$queryRaw(
          Prisma.raw(`
                select n.*, c."role" from public.note n left join public.collaboration c on n.id = c."noteId" 
                where n.id = '${id}' and 
                (n."userId" = '${user.id}' or c."userId" = '${user.id}')
            `),
        )
      )[0] as Note & { role?: any };

      if (result?.folderId) {
        const folder = await this.prisma.folder.findFirst({
          where: {
            id: result.folderId,
          },
        });
        result = {
          ...result,
          folderName: folder.title,
        } as Return;
      }
    }

    if (!result) {
      throw new HttpException(
        'Resource you trying to access can not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...result,
      role: result?.userId === user.id ? null : result.role,
      note: JSON.parse(result?.note),
      description: JSON.parse(result?.description),
      tags: result?.tags?.map((t) => JSON.parse(t)),
      todos: result?.todos?.map((t) => JSON.parse(t)),
      filesUrl: result?.filesUrl?.map((t) => JSON.parse(t)),
      imagesUrl: result?.imagesUrl?.map((t) => JSON.parse(t)),
    };
  }
}
