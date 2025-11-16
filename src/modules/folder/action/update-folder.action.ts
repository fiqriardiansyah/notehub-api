import { Injectable } from '@nestjs/common';
import { Folder } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UpdateFolderAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, data: Partial<Folder>, id: string) {
    const folder = await this.prisma.folder.update({
      where: {
        userId: user.id,
        id,
      },
      data,
    });

    return folder;
  }
}
