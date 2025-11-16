import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RemoveTagNewFlagAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const result = await this.prisma.tag.update({
      where: {
        id,
      },
      data: {
        isNew: false,
      },
    });
    return result;
  }
}
