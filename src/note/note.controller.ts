import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, Query } from "@nestjs/common";
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
        const result = await this.noteService.getNote({ user });
        return {
            data: result
        }
    }

    @Get("/f")
    async getFolderAndContent(@Auth() user: User, @Query() query: { id: string; order?: "desc" | "asc" }) {
        const result = await this.noteService.getFolderAndContent({ user, id: query.id, order: query?.order });
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
        const result = await this.noteService.addNotesToFolder({ user, folderId: data?.folderId, newFolderName: data?.newFolderName, noteIds: data.noteIds });
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

    @Patch("/rnf")
    async removeNotesFromFolder(@Auth() user: User, @Body() data: { noteIds: string[] }) {
        if (!data?.noteIds || !Array.isArray(data.noteIds)) {
            throw new HttpException("Request body noteIds is required", HttpStatus.BAD_REQUEST);
        }
        const result = await this.noteService.removeNotesFromFolder(user, data?.noteIds);
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

    @Post("/many")
    async deleteNotes(@Auth() user: User, @Body() data: { ids: string[] }) {
        const result = await this.noteService.deleteNotes(user, data?.ids);
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

    @Get("/only-todos/:id")
    async getOnlyTodos(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.getOnlyTodos(user, id);
        return {
            data: result
        }
    }

    @Post("share-link")
    async generateShareLink(@Auth() user: User, @Body() data: { noteId: string }) {
        const result = await this.noteService.generateShareLink(user, data.noteId);
        return {
            data: result
        }
    }

    @Get("share-link/:id")
    async getShareLink(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.getShareLink(user, id);
        return {
            data: result,
        }
    }

    @Delete("share-link/:id")
    async deleteShareLink(@Auth() user: User, @Param("id") id: string) {
        const result = await this.noteService.deleteShareLink(user, id);
        return {
            data: result,
        }
    }

    @Get("share/:id")
    async getNoteFromShareLink(@Param("id") id: string) {
        const result = await this.noteService.getNoteFromShareLink(id);
        return {
            data: result,
        }
    }

    @Get("get-note-id/:link")
    async getIdNoteFromLink(@Auth() user: User, @Param("link") link: string) {
        const result = await this.noteService.getIdNoteFromLink(user, link);
        return {
            data: result,
        }
    }
}