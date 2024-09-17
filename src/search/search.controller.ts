import { Controller, Get, Param } from "@nestjs/common";
import { Note, Prisma, User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { PrismaService } from "src/common/prisma.service";

@Controller("/search")
export class SearchController {
    constructor(private prismaService: PrismaService) { }

    @Get("/:query")
    async search(@Auth() user: User, @Param("query") query: string) {
        const result = await this.prismaService.$queryRaw(Prisma.raw(`
            select id, title, description, todos, note, type from public.note
            where "userId" = '${user.id}' and "title" ILIKE '%${query}%'
            `)) as Pick<Note, "id" | "title" | "description" | "todos" | "note" | "type">[]

        return {
            data: result?.map((item) => ({
                ...item,
                todos: item.todos?.map((t) => JSON.parse(t)),
                note: JSON.parse(item?.note),
                description: JSON.parse(item?.description),
            }))
        }
    }
}