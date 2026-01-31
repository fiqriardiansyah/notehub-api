import { IsString } from 'class-validator';

export class DeleteNotificationDto {
  @IsString()
  id: string;
}
