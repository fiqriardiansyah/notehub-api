import { Injectable } from '@nestjs/common';
import { GoogleLoginService } from '../services';

@Injectable()
export class GoogleLoginAction {
  constructor(private googleLoginService: GoogleLoginService) {}

  async execute(data: IAuthMobileRequest) {
    return this.googleLoginService.execute(data);
  }
}
