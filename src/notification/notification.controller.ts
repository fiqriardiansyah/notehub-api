import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { NotificationService } from './notification.service';

@Controller('/notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getAllNotif(@Session() session: UserSession) {
    const result = await this.notificationService.getAllNotif(session.user);
    return {
      data: result,
    };
  }

  @Get('/read/:id')
  async readNotif(@Session() session: UserSession, @Param('id') id: string) {
    const result = await this.notificationService.readNotif(session.user, id);
    return {
      data: result,
    };
  }

  @Delete('/:id')
  async deleteNotif(@Session() session: UserSession, @Param('id') id: string) {
    const result = await this.notificationService.deleteNotif(session.user, id);
    return {
      data: result,
    };
  }

  @Patch('/status-project/:id')
  async updateInvitationProjectStatus(
    @Param('id') id: string,
    @Query('status') status: string,
  ) {
    const result = await this.notificationService.updateInvitationProjectStatus(
      id,
      status,
    );
    return {
      data: result,
    };
  }

  @Get('count')
  async countUnreadNotif(@Session() session: UserSession) {
    const result = await this.notificationService.countUnreadNotif(
      session.user,
    );
    return {
      data: result,
    };
  }
}
