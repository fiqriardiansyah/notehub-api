import { IsString } from 'class-validator';

export class UpdateInvitationDto {
  @IsString()
  status: string;
}
