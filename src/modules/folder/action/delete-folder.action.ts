import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DeleteFolderAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, id: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId: user.id },
    });
    if (!folder) {
      throw new HttpException('Folder not exist', HttpStatus.NOT_FOUND);
    }

    try {
      this.prisma.$transaction([
        this.prisma.$queryRaw(
          Prisma.raw(`
                    delete from public.note n where n."userId" = '${user.id}' and n."folderId" = '${id}'
                `),
        ),
        this.prisma.folder.delete({ where: { id, userId: user.id } }),
      ]);
    } catch (e: any) {
      throw new HttpException(e?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      folderId: id,
    };
  }
}
