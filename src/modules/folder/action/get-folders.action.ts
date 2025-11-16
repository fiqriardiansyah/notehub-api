import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetFoldersAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, id?: string) {
    const folders = await this.prisma.folder.findMany({
      where: {
        userId: user.id,
        ...(id && { id }),
      },
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
    });

    return folders;
  }
}
