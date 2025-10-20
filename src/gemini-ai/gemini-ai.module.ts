import { Module } from '@nestjs/common';
import { GeminiAIService } from './gemini-ai.service';
import { ExtractTextFromImageAction } from './actions';
import { GeminiAIController } from './gemini-ai.controller';

@Module({
  controllers: [GeminiAIController],
  providers: [GeminiAIService, ExtractTextFromImageAction],
  exports: [GeminiAIService],
})
export class GeminiAIModule {}
