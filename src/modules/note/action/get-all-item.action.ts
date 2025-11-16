import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { PrismaService } from 'src/common/prisma.service';
import { parsingNotes } from 'src/lib/utils';

@Injectable()
export class GetAllItemAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: User, order: string = 'desc') {
    let queryString = `
              select * from (
                  select 
                      n."id" as id, n."userId" as "userId", n."updatedAt"::TEXT as "updatedAt", n."filesUrl" as "filesUrl", n."imagesUrl" as "imagesUrl", n."isHang" as "isHang",
                      n."note" as note, n."tags" as tags, n."title" as title, n."todos" as todos, n."updatedBy" as "updatedBy", n."type" as type, n."isSecure" as "isSecure"
                  from public.note n 
                  where n."userId" = '${user.id}'
                  and n."folderId" is null
                  and n."type" != 'habits'
  
                  union
  
                  select 
                      f."id" as id, f."userId" as "userId", f."updatedAt"::TEXT as "updatedAt", NULL as "filesUrl", NULL as "imagesUrl", NULL as "isHang",
                      NULL as note, NULL as tags, f."title" as title, NULL as todos, NULL as "updatedBy", f."type" as type, NULL as "isSecure"
                  from public.folder f
                  where f."userId" = '${user.id}'
              ) i
              order by 
                  case when i."isHang" = true then 0 else 1 end,
                  i."updatedAt" ${order};
          `;

    const items = (await this.prisma.$queryRaw(
      Prisma.raw(queryString),
    )) as Note[];
    const parse = parsingNotes(items);

    return parse;
  }
}
