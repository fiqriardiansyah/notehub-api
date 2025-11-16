import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { generateToken } from 'src/lib/utils';
import { GenerateShareLinkDto } from 'src/modules/note/dto';

@Injectable()
export class GenerateShareLinkAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, payload: GenerateShareLinkDto) {
    const generateString = generateToken();
    const create = await this.prisma.share.create({
      data: {
        link: generateString,
        noteId: payload.noteId,
        userId: user.id,
      },
    });
    return create;
  }
}
