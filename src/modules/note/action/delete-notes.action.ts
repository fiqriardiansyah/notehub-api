import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { DeleteNotesDto } from '../dto';

@Injectable()
export class DeleteNotesAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, payload: DeleteNotesDto) {
    const result = await this.prisma.note.deleteMany({
      where: {
        userId: user.id,
        id: {
          in: payload.ids,
        },
      },
    });
    return result;
  }
}
