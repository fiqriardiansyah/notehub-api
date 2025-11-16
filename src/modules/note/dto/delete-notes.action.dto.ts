import { IsArray, IsString } from 'class-validator';

export class DeleteNotesDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
