import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { TodoDto } from 'src/models/todo.dto';
import { TagDto } from './tag.dto';
import { NoteType } from 'src/enum/note.enum';

class NoteContentDto {
  @IsNumber()
  time: number;

  @IsArray()
  blocks: any[];

  @IsString()
  version: string;
}

class NewFolderDto {
  @IsString()
  @IsOptional()
  title?: string;
}

class FileDto {
  @IsString()
  base64: string;

  @IsString()
  name: string;

  @IsString()
  contentType: string;

  @IsString()
  sizeInMb: string;

  @IsOptional()
  @IsString()
  url?: string;
}

class NotePayloadDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => NoteContentDto)
  note?: NoteContentDto;

  @IsOptional()
  @IsBoolean()
  isSecure?: boolean;

  @IsOptional()
  @IsBoolean()
  isHang?: boolean;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewFolderDto)
  newFolder?: NewFolderDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TodoDto)
  todos?: TodoDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => NoteContentDto)
  description?: NoteContentDto;

  @IsOptional()
  @IsIn(['day', 'weekly', 'monthly'])
  schedulerType?: 'day' | 'weekly' | 'monthly';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  schedulerDays?: string[];

  @IsOptional()
  @IsString()
  schedulerStartTime?: string;

  @IsOptional()
  @IsString()
  schedulerEndTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  schedulerImportant?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  files?: FileDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  images?: FileDto[];
}

export class UpdateNoteDto extends NotePayloadDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsEnum(NoteType, {
    message: 'type must be one of: freetext, todolist, habit',
  })
  type?: NoteType;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[];
}

export class CreateNoteDto extends NotePayloadDto {
  @IsString()
  title: string;

  @IsEnum(NoteType, {
    message: 'type must be one of: freetext, todolist, habit',
  })
  type: NoteType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
