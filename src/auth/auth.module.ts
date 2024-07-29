import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "src/common/prisma.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }