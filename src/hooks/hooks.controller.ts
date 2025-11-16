import { Injectable } from '@nestjs/common';
import {
  AfterHook,
  AuthHookContext,
  Hook,
  UserSession,
} from '@thallesp/nestjs-better-auth';

@Injectable()
@Hook()
export class HooksController {
  constructor() {}

  @AfterHook('/sign-up/email')
  async handle(ctx: AuthHookContext) {
    const user = ctx.body as UserSession['user'];
    console.log('NEW USER', user);
  }
}
