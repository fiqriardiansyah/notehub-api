import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetNoteFromSharedLinkAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(link: string) {
    type ReturnType = Pick<
      Note,
      | 'title'
      | 'note'
      | 'updatedAt'
      | 'updatedBy'
      | 'todos'
      | 'type'
      | 'filesUrl'
      | 'imagesUrl'
    > &
      Pick<User, 'name' | 'image'> & {
        ownerId: string;
        collaborators?: Pick<User, 'name' | 'image'>[];
      };

    const shareLink = await this.prisma.share.findFirst({
      where: { link },
    });
    if (!shareLink) {
      throw new HttpException(
        'Ooops, we found nothing :(',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!shareLink.valid) {
      throw new HttpException('Shared link not valid', HttpStatus.BAD_REQUEST);
    }

    const note = (
      await this.prisma.$queryRaw(
        Prisma.raw(`
            select 
                n."title", n."note", n."updatedAt", n."todos", n."updatedBy", n."filesUrl", n."imagesUrl", n."type", u."name", u."image", u."id" as "ownerId"
            from public.note n join public.user u on n."userId" = u."id" where n."id" = '${shareLink.noteId}'
        `),
      )
    )[0] as ReturnType;

    if (!note) {
      throw new HttpException(
        'Ooops, we found nothing :(',
        HttpStatus.NOT_FOUND,
      );
    }

    const collaborators = (await this.prisma.$queryRaw(
      Prisma.raw(`
            select u."name", u."image" from public."user" u join public."collaboration" c on u."id" = c."userId"
            where c."noteId" = '${shareLink.noteId}'
        `),
    )) as Pick<User, 'name' | 'image'>[];

    return {
      ...note,
      note: JSON.parse(note.note),
      todos: note?.todos?.map((t) => JSON.parse(t)),
      filesUrl: note?.filesUrl?.map((t) => JSON.parse(t)),
      imagesUrl: note?.imagesUrl?.map((t) => JSON.parse(t)),
      collaborators,
    } as ReturnType;
  }
}
