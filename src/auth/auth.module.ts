import { Module } from '@nestjs/common';
import { NoteService } from 'src/note/note.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BucketService } from 'src/bucket/bucket.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NoteService, BucketService],
})
export class AuthModule {}
