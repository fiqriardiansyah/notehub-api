import { IsArray, IsString } from 'class-validator';

export class RemoveNotesFromFolderDto {
  @IsArray()
  @IsString({ each: true })
  noteIds: string[];
}
