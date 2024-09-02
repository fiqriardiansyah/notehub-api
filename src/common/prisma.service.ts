import { Injectable, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, string> implements OnModuleInit {
    constructor() {
        super();
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log("Database connected! ❤️")
        } catch (err) {
            console.log("Failed Connect Database", err);
        }
    }
}