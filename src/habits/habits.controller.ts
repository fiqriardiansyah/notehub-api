import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Timer } from '@prisma/client';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { HabitsService } from './habits.service';

@Controller('/habits')
@UseGuards(AuthGuard)
export class HabitsController {
  constructor(private habitsService: HabitsService) {}

  @Get('/urgent')
  async getUrgentHabit(
    @Session() session: UserSession,
    @Query('limit') limit: number,
  ) {
    const result = await this.habitsService.getUrgentHabit(session.user, limit);
    return {
      data: result,
    };
  }

  @Get('/running-timer')
  async getRunningTimer(@Session() session: UserSession) {
    const result = await this.habitsService.getRunningTimer(session.user);
    return {
      data: result,
    };
  }

  @Get('/:type')
  async getHabits(
    @Session() session: UserSession,
    @Param('type') type: string,
  ) {
    const types = ['all', 'day', 'weekly', 'monthly'];
    if (!types.includes(type)) {
      throw new HttpException('Type habits required!', HttpStatus.BAD_GATEWAY);
    }
    const result = await this.habitsService.getHabits(session.user, type);
    return {
      data: result,
    };
  }

  @Get('/finish/:id')
  async finishHabits(@Session() session: UserSession, @Param('id') id: string) {
    const result = await this.habitsService.finishHabits(session.user, id);
    return {
      data: result,
    };
  }

  @Get('/history/:id')
  async getHabitHistory(
    @Session() session: UserSession,
    @Param('id') id?: string,
  ) {
    const result = await this.habitsService.getHabitHistory(session.user, id);
    return {
      data: result,
    };
  }

  @Post('/timer')
  async setTimerTask(@Body() timer: Partial<Timer>) {
    const result = await this.habitsService.setTimerTask(timer);
    return {
      data: result,
    };
  }

  @Delete('/timer/:noteId/:itemId')
  async deleteTimerTask(
    @Session() session: UserSession,
    @Param() params: { noteId: string; itemId: string },
  ) {
    const result = await this.habitsService.deleteTimerTask(
      params.itemId,
      params.noteId,
    );
    return {
      data: result,
    };
  }

  @Get('/timer/zen')
  async getTimerZenMode(@Session() session: UserSession) {
    const result = await this.habitsService.getTimerZenMode(session.user);
    return {
      data: result,
    };
  }

  @Post('/timer/zen/:id')
  async setZenMode(@Param('id') id: string, @Body() body: { status: boolean }) {
    const result = await this.habitsService.setZenMode(id, body.status);
    return {
      data: result,
    };
  }
}
