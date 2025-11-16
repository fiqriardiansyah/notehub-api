import { IsArray, IsOptional, IsString } from 'class-validator';

export class AddNoteToFolderDto {
  @IsArray()
  @IsString({ each: true })
  noteIds: string[];

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  newFolderName?: string;
}
