import { Injectable } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/common/prisma.service';

type User = UserSession['user'];

@Injectable()
export class DeleteNotificationAction {
  constructor(private prisma: PrismaService) {}

  async execute(user: User, id: string) {
    const result = await this.prisma.notification.delete({
      where: {
        id,
        userId: user.id,
      },
    });
    return result;
  }
}
