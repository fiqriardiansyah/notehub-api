import { Injectable } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/common/prisma.service';

type User = UserSession['user'];

@Injectable()
export class CountUnreadNotificationAction {
  constructor(private prisma: PrismaService) {}

  async execute(user: User) {
    const result = await this.prisma.notification.findMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      select: {
        id: true,
      },
    });
    return result.length;
  }
}
