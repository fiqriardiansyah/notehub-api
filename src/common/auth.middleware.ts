import { HttpException, Injectable, NestMiddleware } from "@nestjs/common";
import { User } from "@prisma/client";
import { Request, Response } from "express";
import { PrismaService } from "./prisma.service";

interface RequestUser extends Request {
    user?: User
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(private readonly prismaService: PrismaService) { }

    async use(req: RequestUser, res: Response, next: (error?: Error | any) => void) {

        const secret = req.headers['x-auth-secret'];
        const token = req.headers['authjs.session-token'] || req.cookies['authjs.session-token']

        if (secret !== "fiqriardiansyah") {
            throw new HttpException("Auth secret not provided or incorrect", 401)
        }

        if (!token) {
            throw new HttpException("Unauthorized", 401)
        }

        const user = await this.prismaService.$queryRawUnsafe(`SELECT * FROM "session"
            INNER JOIN "user"
            ON "session"."userId" = "user"."id"
            WHERE "sessionToken" = $1
        `, token)

        if (!user) {
            throw new HttpException("Unauthorized", 401)
        }

        req.user = user[0] as User;

        next();
    }
}