import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class GetIdNoteFromLinkAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, link: string) {
    const shareLink = await this.prisma.share.findFirst({
      where: {
        userId: user.id,
        link,
      },
    });
    if (!shareLink) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return shareLink.noteId;
  }
}
