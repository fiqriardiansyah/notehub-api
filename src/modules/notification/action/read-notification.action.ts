import { Injectable } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/common/prisma.service';

type User = UserSession['user'];

@Injectable()
export class ReadNotificationAction {
  constructor(private prisma: PrismaService) {}

  async execute(user: User, id: string) {
    const result = await this.prisma.notification.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        isRead: true,
      },
    });
    return result;
  }
}
