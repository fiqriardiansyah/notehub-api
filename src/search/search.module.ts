import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";

@Module({
    providers: [],
    controllers: [SearchController]
})
export class SearchModule { }