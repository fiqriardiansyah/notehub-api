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
import {
  DeleteNotificationDto,
  ReadNotificationDto,
  UpdateInvitationDto,
} from './dto';
import {
  CountUnreadNotificationAction,
  DeleteNotificationAction,
  GetAllNotificationAction,
  ReadNotificationAction,
  UpdateInvitationProjectStatusAction,
} from './action';

@Controller('/notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(
    private countUnreadNotificationAction: CountUnreadNotificationAction,
    private getAllNotificationAction: GetAllNotificationAction,
    private readNotificationAction: ReadNotificationAction,
    private deleteNotificationAction: DeleteNotificationAction,
    private updateInvitationProjectStatusAction: UpdateInvitationProjectStatusAction,
  ) {}

  @Get()
  async getAllNotif(@Session() session: UserSession) {
    const result = await this.getAllNotificationAction.execute(session.user);
    return {
      data: result,
    };
  }

  @Get('/read/:id')
  async readNotif(
    @Session() session: UserSession,
    @Param() param: ReadNotificationDto,
  ) {
    const result = await this.readNotificationAction.execute(
      session.user,
      param.id,
    );
    return {
      data: result,
    };
  }

  @Delete('/:id')
  async deleteNotif(
    @Session() session: UserSession,
    @Param() param: DeleteNotificationDto,
  ) {
    const result = await this.deleteNotificationAction.execute(
      session.user,
      param.id,
    );
    return {
      data: result,
    };
  }

  @Patch('/status-project/:id')
  async updateInvitationProjectStatus(
    @Param('id') id: string,
    @Query() query: UpdateInvitationDto,
  ) {
    const result = await this.updateInvitationProjectStatusAction.execute(
      id,
      query,
    );
    return {
      data: result,
    };
  }

  @Get('count')
  async countUnreadNotif(@Session() session: UserSession) {
    const result = await this.countUnreadNotificationAction.execute(
      session.user,
    );
    return {
      data: result,
    };
  }
}
