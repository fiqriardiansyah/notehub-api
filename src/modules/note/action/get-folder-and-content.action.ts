import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { GetNotesAction } from './get-notes.action';

@Injectable()
export class GetFolderAndContentAction {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getNoteAction: GetNotesAction,
  ) {}

  async execute({
    user,
    id,
    order,
  }: {
    user: User;
    id: string;
    order?: 'desc' | 'asc';
  }) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        userId: user.id,
        id,
      },
    });

    const notes = await this.getNoteAction.execute({
      user,
      folderId: id,
      order,
    });
    return {
      folder,
      notes,
    };
  }
}
