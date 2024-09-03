import { Controller, Get } from "@nestjs/common";

@Controller("/")
export class CommonController {

    @Get("/")
    async() {
        return "Hello world"
    }
}