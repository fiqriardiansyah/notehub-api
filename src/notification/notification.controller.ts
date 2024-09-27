import { Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { Auth } from "src/common/auth.decorator";
import { User } from "@prisma/client";

@Controller("/notification")
export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    @Get()
    async getAllNotif(@Auth() user: User) {
        const result = await this.notificationService.getAllNotif(user);
        return {
            data: result,
        }
    }

    @Get("/read/:id")
    async readNotif(@Auth() user: User, @Param("id") id: string) {
        const result = await this.notificationService.readNotif(user, id);
        return {
            data: result,
        }
    }

    @Delete("/:id")
    async deleteNotif(@Auth() user: User, @Param("id") id: string) {
        const result = await this.notificationService.deleteNotif(user, id);
        return {
            data: result,
        }
    };

    @Patch("/status-project/:id")
    async updateInvitationProjectStatus(@Auth() user: User, @Param("id") id: string, @Query("status") status: string) {
        const result = await this.notificationService.updateInvitationProjectStatus(id, status);
        return {
            data: result,
        }
    }

    @Get("count")
    async countUnreadNotif(@Auth() user: User) {
        const result = await this.notificationService.countUnreadNotif(user);
        return {
            data: result,
        }
    }
}