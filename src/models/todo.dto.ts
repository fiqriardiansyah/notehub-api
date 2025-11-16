import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { TimerDto } from './timer.dto';
import { Type } from 'class-transformer';

export class TodoDto {
  @IsString()
  id: string;

  @IsOptional()
  content: any;

  @IsBoolean()
  isCheck: boolean;

  @IsOptional()
  checkedAt: any;

  @IsOptional()
  @Type(() => TimerDto)
  timer?: TimerDto;
}
