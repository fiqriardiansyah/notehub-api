import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CreateTagManyAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: Tag[]) {
    const result = await this.prisma.tag.createMany({
      data,
    });
    return result;
  }
}
