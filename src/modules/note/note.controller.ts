import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Folder, Tag } from '@prisma/client';
import {
  AllowAnonymous,
  AuthGuard,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';
import {
  AddNotesToFolderAction,
  DeleteFolderAction,
  GetFoldersAction,
  UpdateFolderAction,
} from '../folder/action';
import {
  DeleteShareLinkAction,
  GenerateShareLinkAction,
  GetIdNoteFromLinkAction,
  GetNoteFromSharedLinkAction,
  GetShareLinkAction,
} from '../link/action';
import {
  CreateTagAction,
  CreateTagManyAction,
  DeleteTagAction,
  GetTagsAction,
  RemoveTagNewFlagAction,
} from '../tag/action';
import {
  ChangePasswordNoteAction,
  ChangeTodosAction,
  CreateNoteAction,
  DeleteNoteAction,
  DeleteNotesAction,
  GetAllItemAction,
  GetFolderAndContentAction,
  GetNoteDetailAction,
  GetNotesAction,
  GetOnlyTodosAction,
  IsNoteHasPasswordAction,
  IsPasswordNoteCorrectAction,
  IsSecureNoteAction,
  RemoveNotesFromFolderAction,
  ResetTodoTimerAction,
  SetPasswordNoteAction,
  UpdateNoteAction,
} from './action';
import {
  AddNoteToFolderDto,
  ChangePasswordNoteDto,
  ChangeTodosDto,
  CreateNoteDto,
  CreatePasswordNoteDto,
  DeleteNotesDto,
  GenerateShareLinkDto,
  IsPasswordNoteCorrectDto,
  RemoveNotesFromFolderDto,
  UpdateNoteDto,
} from './dto';

@Controller('/note')
@UseGuards(AuthGuard)
export class NoteController {
  constructor(
    private readonly changePasswordNoteAction: ChangePasswordNoteAction,
    private readonly changeTodosAction: ChangeTodosAction,
    private readonly createNoteAction: CreateNoteAction,
    private readonly deleteNoteAction: DeleteNoteAction,
    private readonly deleteNotesAction: DeleteNotesAction,
    private readonly getAllItemAction: GetAllItemAction,
    private readonly getFolderAndContentAction: GetFolderAndContentAction,
    private readonly getNoteDetailAction: GetNoteDetailAction,
    private readonly getNotesAction: GetNotesAction,
    private readonly getOnlyTodosAction: GetOnlyTodosAction,
    private readonly isNoteHasPasswordAction: IsNoteHasPasswordAction,
    private readonly isPasswordNoteCorrectAction: IsPasswordNoteCorrectAction,
    private readonly isSecureNoteAction: IsSecureNoteAction,
    private readonly removeNotesFromFolderAction: RemoveNotesFromFolderAction,
    private readonly resetTodoTimerAction: ResetTodoTimerAction,
    private readonly setPasswordNoteAction: SetPasswordNoteAction,
    private readonly updateNoteAction: UpdateNoteAction,
    //folders
    private readonly addNotesToFolderAction: AddNotesToFolderAction,
    private readonly deleteFolderAction: DeleteFolderAction,
    private readonly getFoldersAction: GetFoldersAction,
    private readonly updateFolderAction: UpdateFolderAction,
    // links
    private readonly deleteShareLinkAction: DeleteShareLinkAction,
    private readonly generateShareLinkAction: GenerateShareLinkAction,
    private readonly getIdNoteFromLinkAction: GetIdNoteFromLinkAction,
    private readonly getNoteFromSharedLinkAction: GetNoteFromSharedLinkAction,
    private readonly getShareLinkAction: GetShareLinkAction,
    //tags
    private readonly createTagManyAction: CreateTagManyAction,
    private readonly createTagAction: CreateTagAction,
    private readonly deleteTagAction: DeleteTagAction,
    private readonly getTagsAction: GetTagsAction,
    private readonly removeTagNewFlagAction: RemoveTagNewFlagAction,
  ) {}

  @Get()
  async getNotes(@Session() session: UserSession) {
    return await this.getNotesAction.execute({ user: session.user });
  }

  @Get('/f')
  async getFolderAndContent(
    @Session() session: UserSession,
    @Query() query: { id: string; order?: 'desc' | 'asc' },
  ) {
    return await this.getFolderAndContentAction.execute({
      user: session.user,
      id: query.id,
      order: query?.order,
    });
  }

  @Get('/get-all')
  async getAllItems(
    @Session() session: UserSession,
    @Query('order') order: string,
  ) {
    return await this.getAllItemAction.execute(session.user, order);
  }

  @Get('/list-folder')
  async getFolder(@Session() session: UserSession) {
    return await this.getFoldersAction.execute(session.user);
  }

  @Get('/tag')
  async getTag(@Session() session: UserSession) {
    return await this.getTagsAction.execute(session.user);
  }

  @Get('/hpn')
  async isHasPasswordNote(@Session() session: UserSession) {
    return await this.isNoteHasPasswordAction.execute(session.user);
  }

  @Get('/:id')
  async getNote(@Session() session: UserSession, @Param('id') id: string) {
    return await this.getNoteDetailAction.execute(session.user, id);
  }

  @Get('/isn/:id')
  async isSecureNote(@Session() session: UserSession, @Param('id') id: string) {
    return await this.isSecureNoteAction.execute(session.user, id);
  }

  @Post()
  async createNote(
    @Body() data: CreateNoteDto,
    @Session() session: UserSession,
  ) {
    return await this.createNoteAction.execute(session.user.id, data);
  }

  @Post('/spn')
  async setPasswordNote(
    @Session() session: UserSession,
    @Body() data: CreatePasswordNoteDto,
  ) {
    return await this.setPasswordNoteAction.execute(session.user, data);
  }

  @Post('/cpn')
  async changePasswordNote(
    @Session() session: UserSession,
    @Body() data: ChangePasswordNoteDto,
  ) {
    return await this.changePasswordNoteAction.execute(session.user, data);
  }

  @Post('/ipnc')
  async isPasswordNoteCorrect(
    @Session() session: UserSession,
    @Body() data: IsPasswordNoteCorrectDto,
  ) {
    return await this.isPasswordNoteCorrectAction.execute(session.user, data);
  }

  @Post('/tag')
  async createTag(@Session() session: UserSession, @Body() data: Tag) {
    return await this.createTagAction.execute(session.user, data);
  }

  @Post('/tag-many')
  async createTagMany(@Body() data: Tag[]) {
    return await this.createTagManyAction.execute(data);
  }

  @Post('/antf')
  async addNotesToFolder(
    @Session() session: UserSession,
    @Body() data: AddNoteToFolderDto,
  ) {
    return await this.addNotesToFolderAction.execute(session.user, data);
  }

  @Post('ct')
  async changeTodos(
    @Session() session: UserSession,
    @Body() data: ChangeTodosDto,
  ) {
    return await this.changeTodosAction.execute(session.user, data);
  }

  @Put('/update/:id')
  async updateNote(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() data: UpdateNoteDto,
  ) {
    return await this.updateNoteAction.execute(session.user, data, id);
  }

  @Patch('/tag/:id')
  async removeTagNewFlag(@Param('id') id: string) {
    return await this.removeTagNewFlagAction.execute(id);
  }

  @Patch('/f/:id')
  async updateFolder(
    @Session() session: UserSession,
    @Body() data: Partial<Folder>,
    @Param('id') id: string,
  ) {
    return await this.updateFolderAction.execute(session.user, data, id);
  }

  @Patch('/rnf')
  async removeNotesFromFolder(
    @Session() session: UserSession,
    @Body() data: RemoveNotesFromFolderDto,
  ) {
    return await this.removeNotesFromFolderAction.execute(session.user, data);
  }

  @Delete(':id')
  async deleteNote(@Session() session: UserSession, @Param('id') id: string) {
    return await this.deleteNoteAction.execute(session.user, id);
  }

  @Put('/many')
  async deleteNotes(
    @Session() session: UserSession,
    @Body() data: DeleteNotesDto,
  ) {
    return await this.deleteNotesAction.execute(session.user, data);
  }

  @Delete('/folder/:id')
  async deleteFolder(@Session() session: UserSession, @Param('id') id: string) {
    return await this.deleteFolderAction.execute(session.user, id);
  }

  @Delete('/tag/:id')
  async deleteTag(@Session() session: UserSession, @Param('id') id: string) {
    return await this.deleteTagAction.execute(session.user, id);
  }

  @Get('/reset-todos-timer/:id')
  async resetTodoTimer(@Param('id') id: string) {
    return await this.resetTodoTimerAction.execute(id);
  }

  @Get('/only-todos/:id')
  async getOnlyTodos(@Session() session: UserSession, @Param('id') id: string) {
    return await this.getOnlyTodosAction.execute(session.user, id);
  }

  @Post('share-link')
  async generateShareLink(
    @Session() session: UserSession,
    @Body() data: GenerateShareLinkDto,
  ) {
    return await this.generateShareLinkAction.execute(session.user, data);
  }

  @Get('share-link/:id')
  async getShareLink(@Session() session: UserSession, @Param('id') id: string) {
    return await this.getShareLinkAction.execute(session.user, id);
  }

  @Delete('share-link/:id')
  async deleteShareLink(
    @Session() session: UserSession,
    @Param('id') id: string,
  ) {
    return await this.deleteShareLinkAction.execute(session.user, id);
  }

  @Get('share/:id')
  @AllowAnonymous()
  async getNoteFromSharedLink(@Param('id') id: string) {
    return await this.getNoteFromSharedLinkAction.execute(id);
  }

  @Get('get-note-id/:link')
  async getIdNoteFromLink(
    @Session() session: UserSession,
    @Param('link') link: string,
  ) {
    return await this.getIdNoteFromLinkAction.execute(session.user, link);
  }
}
