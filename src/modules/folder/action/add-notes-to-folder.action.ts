import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { AddNoteToFolderDto } from 'src/modules/note/dto';

@Injectable()
export class AddNotesToFolderAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, payload: AddNoteToFolderDto) {
    try {
      let finalFolderId = payload.folderId;
      if (payload.newFolderName && !finalFolderId) {
        finalFolderId = (
          await this.prisma.folder.create({
            data: {
              title: payload.newFolderName,
              userId: user.id,
              type: 'folder',
            },
          })
        ).id;
      }
      await this.prisma.$transaction([
        this.prisma.folder.update({
          where: {
            userId: user.id,
            id: finalFolderId,
          },
          data: {
            updatedAt: new Date().toISOString(),
          },
        }),
        this.prisma.note.updateMany({
          where: {
            userId: user.id,
            id: {
              in: payload.noteIds,
            },
          },
          data: {
            folderId: finalFolderId,
          },
        }),
      ]);
      return finalFolderId;
    } catch (e: any) {
      throw new HttpException(e?.message, HttpStatus.EXPECTATION_FAILED);
    }
  }
}
