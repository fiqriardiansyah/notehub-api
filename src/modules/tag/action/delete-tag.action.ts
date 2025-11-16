import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DeleteTagAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, id: string) {
    const result = await this.prisma.tag.delete({
      where: {
        creatorId: user.id,
        id,
      },
    });
    return result;
  }
}
