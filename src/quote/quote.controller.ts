import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { QuoteService } from './quote.service';

@Controller('/quote')
@UseGuards(AuthGuard)
export class QuoteController {
  constructor(private quoteService: QuoteService) {}

  @Get('/')
  async getQuote(@Session() session: UserSession) {
    const result = await this.quoteService.getQuote(session.user);
    return {
      data: result,
    };
  }
}
