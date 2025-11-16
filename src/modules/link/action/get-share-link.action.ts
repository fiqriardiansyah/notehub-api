import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetShareLinkAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, noteId: string) {
    const shareLink = await this.prisma.share.findFirst({
      where: {
        userId: user.id,
        noteId,
      },
    });
    return shareLink;
  }
}
