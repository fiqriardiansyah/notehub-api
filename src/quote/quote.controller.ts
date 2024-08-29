import { Controller, Get, Param } from "@nestjs/common";
import { User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { QuoteService } from "./quote.service";

@Controller("/quote")
export class QuoteController {
    constructor(private quoteService: QuoteService) { }

    @Get("/")
    async getQuote(@Auth() user: User) {
        const result = await this.quoteService.getQuote(user);
        return {
            data: result,
        }
    }
}