import { IsString, MinLength } from 'class-validator';

export class ChangePasswordNoteDto {
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  'old-password': string;
}
