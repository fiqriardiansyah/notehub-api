import { Module } from '@nestjs/common';
import {
  DeleteShareLinkAction,
  GenerateShareLinkAction,
  GetIdNoteFromLinkAction,
  GetNoteFromSharedLinkAction,
  GetShareLinkAction,
} from './action';
import { BucketService } from 'src/bucket/bucket.service';

@Module({
  providers: [
    BucketService,
    DeleteShareLinkAction,
    GenerateShareLinkAction,
    GetIdNoteFromLinkAction,
    GetNoteFromSharedLinkAction,
    GetShareLinkAction,
  ],
  exports: [
    DeleteShareLinkAction,
    GenerateShareLinkAction,
    GetIdNoteFromLinkAction,
    GetNoteFromSharedLinkAction,
    GetShareLinkAction,
  ],
})
export class LinkModule {}
