import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ProfileAction } from './actions';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private profileAction: ProfileAction) {}

  @Get('profile')
  async getMyProfile(@Session() session: UserSession) {
    return this.profileAction.execute(session.user.id);
  }
}
