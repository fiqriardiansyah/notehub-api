import { Module } from '@nestjs/common';
import { AuthMobileController } from './auth-mobile.controller';
import { AuthMobileService } from './auth-mobile.service';
import { GoogleLoginAction } from './actions';
import { GoogleLoginService } from './services';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { NoteService } from 'src/note/note.service';
import { BucketService } from 'src/bucket/bucket.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET,
    }),
  ],
  exports: [JwtModule],
  controllers: [AuthMobileController],
  providers: [
    AuthMobileService,
    GoogleLoginAction,
    GoogleLoginService,
    AuthService,
    NoteService,
    BucketService,
  ],
})
export class AuthMobileModule {}
