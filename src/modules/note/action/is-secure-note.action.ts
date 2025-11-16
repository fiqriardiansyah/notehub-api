import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class IsSecureNoteAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, id: string) {
    const result = await this.prisma.note.findFirst({
      where: {
        AND: [{ userId: user.id }, { id }],
      },
    });

    if (!result) return false;

    return result?.isSecure;
  }
}
