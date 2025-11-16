import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateShareLinkDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;
}
