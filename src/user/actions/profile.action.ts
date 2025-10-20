import { Injectable } from '@nestjs/common';
import { ProfileService } from '../services';

@Injectable()
export class ProfileAction {
  constructor(private profileService: ProfileService) {}

  async execute(userId: string) {
    return this.profileService.execute(userId);
  }
}
