import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { BucketModule } from './bucket/bucket.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './filter';
import { GeminiAIModule } from './gemini-ai/gemini-ai.module';
import { HabitsModule } from './habits/habits.module';
import { TransformInterceptor } from './interceptors';
import { auth } from './lib/auth';
import { MailerModule } from './mailer/mailer.module';
import { FolderModule } from './modules/folder/folder.module';
import { LinkModule } from './modules/link/link.module';
import { NoteModule } from './modules/note/note.module';
import { TagModule } from './modules/tag/tag.module';
import { QuoteModule } from './quote/quote.module';
import { SearchModule } from './search/search.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './modules/notification/notifiication.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRoot({
      auth,
      disableGlobalAuthGuard: true,
      disableBodyParser: true,
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    QuoteModule,
    HabitsModule,
    SearchModule,
    CollaborationModule,
    MailerModule,
    NotificationModule,
    BucketModule,
    UserModule,
    GeminiAIModule,
    TagModule,
    LinkModule,
    FolderModule,
    NoteModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
