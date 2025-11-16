import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class IsNoteHasPasswordAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User) {
    const result = await this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    return Boolean(result.passwordNote);
  }
}
