import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/common/prisma.service';

type User = UserSession['user'];

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}

  TYPE_TIMER_HABITS = 'notification-timer-habits';
  TYPE_INVITE_TO_PROJECT = 'notification-invite-to-project';
  TYPE_LEAVE_PROJECT = 'notification-leave-project';

  async createNotification(data: Notification[]) {
    return await this.prismaService.notification.createMany({
      data,
    });
  }

  async getAllNotif(user: User) {
    const result = await this.prismaService.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return result;
  }

  async readNotif(user: User, id: string) {
    const result = await this.prismaService.notification.update({
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

  async deleteNotif(user: User, id: string) {
    const result = await this.prismaService.notification.delete({
      where: {
        id,
        userId: user.id,
      },
    });
    return result;
  }

  async updateInvitationProjectStatus(id: string, message: string) {
    const findInvitation = await this.prismaService.notification.findFirst({
      where: { id },
    });
    if (!findInvitation) {
      throw new HttpException('Invitation not found', HttpStatus.NOT_FOUND);
    }
    const update = await this.prismaService.notification.update({
      where: { id },
      data: {
        content: {
          ...(findInvitation.content as {}),
          message,
        },
      },
    });
    return update;
  }

  async countUnreadNotif(user: User) {
    const result = await this.prismaService.notification.findMany({
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
