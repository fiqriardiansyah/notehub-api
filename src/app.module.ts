import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { BucketController } from './bucket/bucket.controller';
import { BucketModule } from './bucket/bucket.module';
import { CollaborationController } from './collaboration/collaboration.controller';
import { CollaborationModule } from './collaboration/collaboration.module';
import { AuthMiddleware } from './common/auth.middleware';
import { CommonModule } from './common/common.module';
import { HabitsController } from './habits/habits.controller';
import { HabitsModule } from './habits/habits.module';
import { MailerModule } from './mailer/mailer.module';
import { NoteController } from './note/note.controller';
import { NoteModule } from './note/note.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notifiication.module';
import { QuoteController } from './quote/quote.controller';
import { QuoteModule } from './quote/quote.module';
import { SearchController } from './search/search.controller';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    NoteModule,
    QuoteModule,
    HabitsModule,
    SearchModule,
    CollaborationModule,
    MailerModule,
    NotificationModule,
    BucketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { method: RequestMethod.POST, path: "collab/invite/validate" },
        { method: RequestMethod.GET, path: "note/share/:id" },
        { method: RequestMethod.POST, path: "bucket/test-upload" },
      )
      .forRoutes(NoteController, HabitsController, QuoteController, SearchController, CollaborationController, NotificationController, BucketController)
  }
}
