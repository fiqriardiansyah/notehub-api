import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ProfileService } from './services';
import { ProfileAction } from './actions';

@Module({
  controllers: [UserController],
  providers: [ProfileService, ProfileAction],
})
export class UserModule {}
