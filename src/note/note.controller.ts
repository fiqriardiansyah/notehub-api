import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { Tag, User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { NoteService } from "./note.service";
import { ChangePasswordNote, CreateNote, CreatePasswordNote } from "./note.models";
import { BaseResponse } from "src/model";

@Controller("/note")
export class NoteController {
    constructor(private noteService: NoteService) { }

    @Get()
    async getNotes(@Auth() user: User) {
        const result = await this.noteService.getNote(user);
        return {
            data: result
        }
    }

    @Get("/tag")
    async getTag(@Auth() user: User) {
        console.log("tag", user)
        const result = await this.noteService.getTags(user);
        return {
            data: result,
        }
    }

    @Get("/hpn") // has password note
    async hasPasswordNote(@Auth() user: User) {
        const result = await this.noteService.hasPasswordNote(user);
        return {
            data: result,
        }
    }

    @Get("/:id")
    async getNote(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.getOneNote(user, id);
        return {
            data: result
        }
    }

    @Post()
    async createNote(@Body() data: CreateNote, @Auth() user: User): Promise<BaseResponse> {
        const result = await this.noteService.createNote(user, data);
        return {
            data: result
        }
    }

    @Post("/spn") // create password note
    async setPasswordNote(@Auth() user: User, @Body() data: CreatePasswordNote) {
        const result = await this.noteService.setPasswordNote(user, data);
        return {
            data: result,
        }
    }

    @Post("/cpn")
    async changePasswordNote(@Auth() user: User, @Body() data: ChangePasswordNote) {
        const result = await this.noteService.changePasswordNote(user, data);
        return {
            data: result,
        }
    }

    @Post("/tag")
    async createTag(@Auth() user: User, @Body() data: Tag) {
        const result = await this.noteService.createTag(user, data);
        return {
            data: result
        }
    }

    @Post("/tag-many")
    async createTagMany(@Body() data: Tag[]) {
        const result = await this.noteService.createTagMany(data);
        return {
            data: result,
        }
    }

    @Put("/update/:id")
    async updateNote(@Auth() user: User, @Param("id") id: string, @Body() data: CreateNote) {
        const result = await this.noteService.updateNote(user, data, id);
        return {
            data: result,
        }
    }

    @Patch("/tag/:id")
    async removeTagNewFlag(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.removeTagNewFlag(id);
        return {
            data: result,
        }
    }

    @Delete(":id")
    async deleteNote(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.deleteNote(id);
        return {
            data: result
        }
    }

    @Delete("/tag/:id")
    async deleteTag(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.deleteNote(id);
        return {
            data: result,
        }
    }
}