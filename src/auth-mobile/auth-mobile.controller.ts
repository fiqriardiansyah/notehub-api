import { Body, Controller, Post } from '@nestjs/common';
import { GoogleLoginAction } from './actions';

@Controller('auth-mobile')
export class AuthMobileController {
  constructor(private googleLoginAction: GoogleLoginAction) {}

  @Post()
  async googleLogin(@Body() body: IAuthMobileRequest) {
    return this.googleLoginAction.execute(body);
  }
}
