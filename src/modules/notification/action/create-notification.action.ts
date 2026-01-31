import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CreateNotificationAction {
  constructor(private prisma: PrismaService) {}

  async execute(data: Notification[]) {
    return await this.prisma.notification.createMany({
      data,
    });
  }
}
