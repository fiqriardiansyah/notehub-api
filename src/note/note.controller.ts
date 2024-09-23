import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { Folder, Tag, User } from "@prisma/client";
import { Auth } from "src/common/auth.decorator";
import { NoteService } from "./note.service";
import { AddNoteToFolder, ChangePasswordNote, CreateNote, CreatePasswordNote, Todo } from "./note.models";
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

    @Get("/f/:id")
    async getFolderAndContent(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.getFolderAndContent(user, id);
        return {
            data: result,
        }
    }

    @Get("/get-all")
    async getAllItems(@Auth() user: User, @Query("order") order: string) {
        const result = await this.noteService.getAllItems(user, order);
        return {
            data: result,
        }
    }

    @Get("/list-folder")
    async getFolder(@Auth() user: User) {
        const result = await this.noteService.getFolder(user);
        return {
            data: result,
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

    @Get("/isn/:id") //is-secure-note
    async isSecureNote(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.isSecureNote(user, id);
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

    @Post("/spn") // set password note
    async setPasswordNote(@Auth() user: User, @Body() data: CreatePasswordNote) {
        const result = await this.noteService.setPasswordNote(user, data);
        return {
            data: result,
        }
    }

    @Post("/cpn") // change password note
    async changePasswordNote(@Auth() user: User, @Body() data: ChangePasswordNote) {
        const result = await this.noteService.changePasswordNote(user, data);
        return {
            data: result,
        }
    }

    @Post("/ipnc") // is password note correct
    async isPasswordNoteCorrect(@Auth() user: User, @Body() data: ChangePasswordNote) {
        const result = await this.noteService.isPasswordNoteCorrect(user, data);
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

    @Post("/antf") // add notes to folder
    async addNotesToFolder(@Auth() user: User, @Body() data: AddNoteToFolder) {
        const result = await this.noteService.addNotesToFolder({ user, folderId: data.folderId, noteIds: data.noteIds });
        return {
            data: result,
        }
    }

    @Post("ct") //change todos
    async changeTodos(@Auth() user: User, @Body() data: { noteId: string, todos: Todo[] }) {
        const result = await this.noteService.changeTodos({ user, ...data });
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

    @Patch("/f/:id")
    async updateFolder(@Auth() user: User, @Body() data: Partial<Folder>, @Param("id") id: string) {
        const result = await this.noteService.updateFolder(user, data, id);
        return {
            data: result,
        }
    }

    @Delete(":id")
    async deleteNote(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.deleteNote(user, id);
        return {
            data: result
        }
    }

    @Delete("/folder/:id")
    async deleteFolder(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.deleteFolder(user, id);
        return {
            data: result
        }
    }

    @Delete("/tag/:id")
    async deleteTag(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.deleteTag(user, id);
        return {
            data: result,
        }
    }

    @Get("/reset-todos-timer/:id") /// for debuging only
    async resetTodoTimer(@Param("id") id: string) {
        const result = await this.noteService.resetTodoTimer({ noteId: id });
        return {
            data: result,
        }
    }
}