import { Module } from "@nestjs/common";
import { NoteService } from "./note.service";
import { NoteController } from "./note.controller";
import { BucketService } from "src/bucket/bucket.service";

@Module({
    providers: [NoteService, BucketService],
    controllers: [NoteController],
})
export class NoteModule { }