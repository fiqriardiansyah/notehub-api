import { Module } from '@nestjs/common';
import { BucketService } from 'src/bucket/bucket.service';
import {
  ChangePasswordNoteAction,
  ChangeTodosAction,
  CreateNoteAction,
  CreateWellcomingNoteAction,
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
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { TagModule } from '../tag/tag.module';
import { FolderModule } from '../folder/folder.module';
import { LinkModule } from '../link/link.module';

@Module({
  imports: [TagModule, FolderModule, LinkModule],
  providers: [
    NoteService,
    BucketService,
    ChangePasswordNoteAction,
    ChangeTodosAction,
    CreateNoteAction,
    CreateWellcomingNoteAction,
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
  ],
  controllers: [NoteController],
})
export class NoteModule {}
