import { IsString, MinLength } from 'class-validator';

export class CreatePasswordNoteDto {
  @IsString()
  @MinLength(6)
  password: string;
}
