import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CreateTagAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, data: Tag) {
    const result = await this.prisma.tag.create({
      data: {
        ...data,
        isNew: true,
        creatorId: user.id,
      },
    });
    return result;
  }
}
