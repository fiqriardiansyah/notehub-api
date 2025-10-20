import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/common/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GoogleLoginService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async execute(data: IAuthMobileRequest) {
    const user = await this.authService.getUserByEmail(data.email);
    if (!user) {
      const newAccount = await this.authService.createUser({
        email: data.email,
        emailVerified: new Date(),
        image: data.photo,
        name: data.name,
      });
      const session = await this.authService.createSession({
        expires: new Date(new Date().getDate() + 2),
        sessionToken: uuid(),
        userId: newAccount.id,
      });
      await this.authService.createVerificationToken({
        token: session.sessionToken,
        expires: new Date(new Date().getDate() + 2),
        identifier: 'bearer',
      });
      return {
        token: session.sessionToken,
        email: data.email,
        name: data.name,
        photo: data.photo,
      };
    }
    const session = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (!session) {
      const create = await this.prisma.session.create({
        data: {
          expires: new Date(new Date().getDate() + 2),
          sessionToken: uuid(),
          userId: user.id,
        },
      });
      return {
        token: create.sessionToken,
        email: data.email,
        name: data.name,
        photo: data.photo,
      };
    }
    const create = await this.prisma.session.update({
      where: {
        sessionToken: session.sessionToken,
      },
      data: {
        expires: new Date(new Date().getDate() + 2),
        sessionToken: uuid(),
      },
    });
    return {
      token: create.sessionToken,
      email: data.email,
      name: data.name,
      photo: data.photo,
    };
  }
}
