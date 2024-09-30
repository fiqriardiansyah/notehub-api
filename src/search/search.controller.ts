import { Controller, Get, Param } from "@nestjs/common";
import { Note, Prisma, User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { PrismaService } from "src/common/prisma.service";

@Controller("/search")
export class SearchController {
    constructor(private prismaService: PrismaService) { }

    @Get("/:query")
    async search(@Auth() user: User, @Param("query") query: string) {
        type ReturnType = Pick<Note, "id" | "title" | "description" | "todos" | "note" | "type" | "updatedAt"> &
            Pick<User, "name" | "image"> & {
                isOwner: boolean;
            }

        const result = await this.prismaService.$queryRaw(Prisma.raw(`
            select 
                u."name", u."image", n."id", n."title", n."description", n."todos", n."note", n."type", n."updatedAt",
                case 
                    when n."userId" = '${user.id}' then true
                    else false
                end as "isOwner"
            from public.user u join 
                (
                    select n.* from public.note n where n."userId" = '${user.id}' and (n."title" ilike '%${query}%')
                    union
                    select n2.* from public.note n2 join public.collaboration c 
                    on n2."id" = c."noteId" where c."userId" = '${user.id}' and (n2."title" ilike '%${query}%')
                ) as n
            on u."id" = n."userId"
            order by n."updatedAt"
        `)) as ReturnType[]

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