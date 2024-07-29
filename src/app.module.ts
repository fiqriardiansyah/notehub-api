import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './common/auth.middleware';
import { CommonModule } from './common/common.module';
import { NoteModule } from './note/note.module';
import { NoteController } from './note/note.controller';

@Module({
  imports: [CommonModule, AuthModule, NoteModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(NoteController)
  }
}
