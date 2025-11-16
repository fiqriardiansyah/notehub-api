import { Module } from '@nestjs/common';
import {
  AddNotesToFolderAction,
  DeleteFolderAction,
  GetFoldersAction,
  UpdateFolderAction,
} from './action';
import { BucketService } from 'src/bucket/bucket.service';

@Module({
  providers: [
    BucketService,
    AddNotesToFolderAction,
    DeleteFolderAction,
    GetFoldersAction,
    UpdateFolderAction,
  ],
  exports: [
    AddNotesToFolderAction,
    DeleteFolderAction,
    GetFoldersAction,
    UpdateFolderAction,
  ],
})
export class FolderModule {}
