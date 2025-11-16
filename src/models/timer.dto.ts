import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TimerDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  itemId: string;

  @IsString()
  noteId: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isEnd?: boolean;

  @IsOptional()
  @IsBoolean()
  autoComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  isZenMode?: boolean;
}
