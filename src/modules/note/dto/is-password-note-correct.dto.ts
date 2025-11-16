import { IsString, MinLength } from 'class-validator';

export class IsPasswordNoteCorrectDto {
  @IsString()
  @MinLength(6)
  password: string;
}
