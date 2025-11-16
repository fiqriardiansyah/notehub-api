const dayjs = require('dayjs');
import { Injectable } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/common/prisma.service';

type User = UserSession['user'];

@Injectable()
export class QuoteService {
  constructor(private prismaService: PrismaService) {}

  async getQuote(user: User) {
    const lastQuote = await this.prismaService.userQuote.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!lastQuote) {
      await this.prismaService.userQuote.create({
        data: {
          quoteId: 1,
          updatedAt: new Date().toISOString(),
          userId: user.id,
        },
      });
      return await this.prismaService.quote.findFirst({
        where: {
          id: 1,
        },
      });
    }

    if (dayjs(lastQuote.updatedAt).isSame(new Date().toISOString(), 'date')) {
      return null;
    }

    await this.prismaService.userQuote.update({
      where: {
        id: lastQuote.id,
      },
      data: {
        updatedAt: new Date().toISOString(),
        quoteId: lastQuote.quoteId + 1,
      },
    });

    return await this.prismaService.quote.findFirst({
      where: {
        id: lastQuote.quoteId + 1,
      },
    });
  }
}
