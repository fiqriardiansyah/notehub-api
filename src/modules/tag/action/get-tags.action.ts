import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetTagsAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User) {
    const result = await this.prisma.tag.findMany({
      where: {
        OR: [
          {
            creatorId: user.id,
          },
          {
            creatorId: null,
          },
        ],
      },
      orderBy: {
        text: 'asc',
      },
    });

    return result;
  }
}
