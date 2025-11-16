import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DeleteShareLinkAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, id: string) {
    const deleteShare = await this.prisma.share.delete({
      where: { id },
    });
    return deleteShare;
  }
}
