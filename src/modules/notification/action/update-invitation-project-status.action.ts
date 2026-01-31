import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UpdateInvitationDto } from '../dto';

@Injectable()
export class UpdateInvitationProjectStatusAction {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, param: UpdateInvitationDto) {
    const findInvitation = await this.prisma.notification.findFirst({
      where: { id },
    });
    if (!findInvitation) {
      throw new HttpException('Invitation not found', HttpStatus.NOT_FOUND);
    }
    const update = await this.prisma.notification.update({
      where: { id },
      data: {
        content: {
          ...(findInvitation.content as {}),
          message: param.status,
        },
      },
    });
    return update;
  }
}
