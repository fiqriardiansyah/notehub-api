import { Injectable } from '@nestjs/common';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { CreatePasswordNoteDto } from '../dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SetPasswordNoteAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, data: CreatePasswordNoteDto) {
    const hashPassword = await bcrypt.hash(data.password, 10);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordNote: hashPassword,
      },
    });
    return 'Password note has been created!';
  }
}
