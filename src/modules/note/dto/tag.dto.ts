import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TagDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsString()
  flag: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  group?: string | null;

  @IsBoolean()
  isNew: boolean;

  @IsString()
  creatorId: string;
}
