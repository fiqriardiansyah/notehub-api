import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { ChangePasswordNoteDto } from '../dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordNoteAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, data: ChangePasswordNoteDto) {
    const userFind = await this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!userFind.passwordNote) {
      throw new HttpException(
        'You havent set a password for secure note yet',
        HttpStatus.BAD_REQUEST,
      );
    }

    const matchPass = await bcrypt.compare(
      data['old-password'],
      userFind.passwordNote,
    );
    if (!matchPass) {
      throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
    }

    const hassPassword = await bcrypt.hash(data.password, 10);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordNote: hassPassword,
      },
    });
    return 'Password changed';
  }
}
