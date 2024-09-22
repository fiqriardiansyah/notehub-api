import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { InvitationData } from "src/model";
import { CollaborationService } from "./collaboration.service";

@Controller("collab")
export class CollaborationController {
    constructor(private collaborationService: CollaborationService) { }

    @Post("/invite")
    async invitate(@Auth() user: User, @Body() body: InvitationData) {
        const result = await this.collaborationService.invite(user, body);
        return {
            data: result
        }
    }

    @Get("/all")
    async getMyCollaborateProject(@Auth() user: User) {
        const result = await this.collaborationService.getMyCollaborateProject(user);
        return {
            data: result,
        }
    }

    @Get("/invite/:noteId")
    async getInvitation(@Auth() user: User, @Param("noteId") noteId: string, @Query("status") status: string) {
        const result = await this.collaborationService.getInvitation(user, noteId, status);
        return {
            data: result
        }
    }

    @Post("/invite/validate")
    async validateInvitation(@Query("token") token: string, @Query("status") status: "rejected" | "accepted") {
        if (!token) return {
            data: null,
        };
        if (status !== "rejected" && status !== "accepted") {
            return {
                data: null,
            }
        }
        const result = await this.collaborationService.validateInvitation(token, status);
        return {
            data: result,
        }
    }

    @Get("/:noteId")
    async collabAccount(@Auth() user: User, @Param("noteId") noteId: string) {
        const result = await this.collaborationService.collabAccount(user, noteId);
        return {
            data: result,
        }
    }

    @Delete("/invite/:id")
    async cancelInvitation(@Auth() user: User, @Param("id") id: string) {
        const result = await this.collaborationService.cancelInvitation(user, id);
        return {
            data: result,
        }
    }

    @Delete("/:collabId")
    async removeCollab(@Auth() user: User, @Param("collabId") collabId: string) {
        const result = await this.collaborationService.removeCollab(user, collabId);
        return {
            data: result,
        }
    }

    @Patch("/:collabId")
    async changeRoleCollab(@Auth() user: User, @Param("collabId") collabId: string, @Body() data: { role: string }) {
        if (!data || (data?.role !== "viewer" && data?.role !== "editor")) {
            throw new HttpException("Role is either viewer or editor", HttpStatus.BAD_REQUEST);
        }
        const result = await this.collaborationService.changeRoleCollab(user, collabId, data.role);
        return {
            data: result,
        }
    }

}