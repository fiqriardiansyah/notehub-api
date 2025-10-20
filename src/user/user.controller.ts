import { Controller, Get } from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/common/auth.decorator';
import { ProfileAction } from './actions';

@Controller('user')
export class UserController {
  constructor(private profileAction: ProfileAction) {}

  @Get('profile')
  async getMyProfile(@Auth() user: User) {
    return this.profileAction.execute(user.id);
  }
}
