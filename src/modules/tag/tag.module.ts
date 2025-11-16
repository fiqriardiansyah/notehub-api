import { Module } from '@nestjs/common';
import {
  CreateTagAction,
  CreateTagManyAction,
  DeleteTagAction,
  GetTagsAction,
  RemoveTagNewFlagAction,
} from './action';
import { BucketService } from 'src/bucket/bucket.service';

@Module({
  providers: [
    BucketService,
    CreateTagManyAction,
    CreateTagAction,
    DeleteTagAction,
    GetTagsAction,
    RemoveTagNewFlagAction,
  ],
  exports: [
    CreateTagManyAction,
    CreateTagAction,
    DeleteTagAction,
    GetTagsAction,
    RemoveTagNewFlagAction,
  ],
})
export class TagModule {}
