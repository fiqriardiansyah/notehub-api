import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { CreatePasswordNoteDto } from '../dto';

@Injectable()
export class IsPasswordNoteCorrectAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, data: CreatePasswordNoteDto) {
    const result = await this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        passwordNote: true,
      },
    });

    if (!result.passwordNote) {
      throw new HttpException(
        'Password Note has not been set yet',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const match = await bcrypt.compare(data.password, result.passwordNote);
    return match;
  }
}
