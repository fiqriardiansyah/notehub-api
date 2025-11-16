import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { RemoveNotesFromFolderDto } from '../dto';

@Injectable()
export class RemoveNotesFromFolderAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, payload: RemoveNotesFromFolderDto) {
    const result = await this.prisma.note.updateMany({
      where: {
        userId: user.id,
        id: {
          in: payload.noteIds,
        },
      },
      data: {
        folderId: null,
      },
    });
    return result;
  }
}
