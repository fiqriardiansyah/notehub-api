import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiAIService extends GoogleGenAI {
  constructor(config: ConfigService) {
    super({
      apiKey: config.getOrThrow('GOOGLE_GEMINI_API_KEY'),
    });
  }
}
