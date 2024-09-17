import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './common/auth.middleware';
import { CommonModule } from './common/common.module';
import { NoteController } from './note/note.controller';
import { NoteModule } from './note/note.module';
import { QuoteController } from './quote/quote.controller';
import { QuoteModule } from './quote/quote.module';
import { HabitsModule } from './habits/habits.module';
import { HabitsController } from './habits/habits.controller';
import { ScheduleModule } from '@nestjs/schedule';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(NoteController, HabitsController, QuoteController, SearchController)
  }
}
