import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { InvitationData } from 'src/model';
import { CollaborationService } from './collaboration.service';

@Controller('collab')
@UseGuards(AuthGuard)
export class CollaborationController {
  constructor(private collaborationService: CollaborationService) {}

  @Post('/invite')
  async invitate(
    @Session() session: UserSession,
    @Body() body: InvitationData,
  ) {
    const result = await this.collaborationService.invite(session.user, body);
    return {
      data: result,
    };
  }

  @Get('/all')
  async getMyCollaborateProject(
    @Session() session: UserSession,
    @Query('order') order: string,
  ) {
    const result = await this.collaborationService.getMyCollaborateProject(
      session.user,
      order,
    );
    return {
      data: result,
    };
  }

  @Get('/invite/:noteId')
  async getInvitation(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
    @Query('status') status: string,
  ) {
    const result = await this.collaborationService.getInvitation(
      session.user,
      noteId,
      status,
    );
    return {
      data: result,
    };
  }

  @Post('/invite/validate')
  async validateInvitation(
    @Query('token') token: string,
    @Query('id') id: string,
    @Query('status') status: 'rejected' | 'accepted',
  ) {
    const result = await this.collaborationService.validateInvitation(
      token,
      status,
      id,
    );
    return {
      data: result,
    };
  }

  @Post('/invite/validate-from-notif')
  async validateInvitationFromNotif(
    @Body()
    data: {
      invitationId: string;
      notifId: string;
      status: 'rejected' | 'accepted';
    },
  ) {
    const result =
      await this.collaborationService.validateInvitationFromNotif(data);
    return {
      data: result,
    };
  }

  @Get('/:noteId')
  async collabAccount(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
  ) {
    const result = await this.collaborationService.collabAccount(
      session.user,
      noteId,
    );
    return {
      data: result,
    };
  }

  @Delete('/invite/:id')
  async cancelInvitation(
    @Session() session: UserSession,
    @Param('id') id: string,
  ) {
    const result = await this.collaborationService.cancelInvitation(
      session.user,
      id,
    );
    return {
      data: result,
    };
  }

  @Delete('/:collabId')
  async removeCollab(
    @Session() session: UserSession,
    @Param('collabId') collabId: string,
  ) {
    const result = await this.collaborationService.removeCollab(
      session.user,
      collabId,
    );
    return {
      data: result,
    };
  }

  @Patch('/:collabId')
  async changeRoleCollab(
    @Session() session: UserSession,
    @Param('collabId') collabId: string,
    @Body() data: { role: string },
  ) {
    if (!data || (data?.role !== 'viewer' && data?.role !== 'editor')) {
      throw new HttpException(
        'Role is either viewer or editor',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.collaborationService.changeRoleCollab(
      session.user,
      collabId,
      data.role,
    );
    return {
      data: result,
    };
  }

  @Delete('leave/:id')
  async leaveCollaborateProject(
    @Session() session: UserSession,
    @Param('id') collaborateId: string,
  ) {
    const result = await this.collaborationService.leaveCollaborateProject(
      session.user,
      collaborateId,
    );
    return {
      data: result,
    };
  }
}
