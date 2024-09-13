import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Folder, Note, Prisma, Tag, User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { PrismaService } from "src/common/prisma.service";
import { ValidationService } from "src/common/validation.service";
import { parsingNotes } from "src/lib/utils";
import { ChangePasswordNote, CreateNote, CreatePasswordNote, Todo } from "./note.models";
import { NoteValidation } from "./note.validation";

const schedulerImportant = (schedulerType?: "day" | "weekly" | "monthly") => {
    if (!schedulerType) return null;
    if (schedulerType === "day") return 1;
    if (schedulerType === "weekly") return 2;
    if (schedulerType === "monthly") return 3;
}

@Injectable()
export class NoteService {
    constructor(private prismaService: PrismaService, private validationService: ValidationService) { }

    async createNote(user: User, data: CreateNote) {
        const validate = this.validationService.validate(NoteValidation.CREATE, data) as CreateNote;

        let folder;
        if (data?.newFolder?.title && !data?.folderId) {
            folder = await this.prismaService.folder.create({
                data: {
                    title: data.newFolder?.title,
                    userId: user.id,
                    type: "folder",
                }
            });
        }

        const save = await this.prismaService.note.create({
            data: {
                type: data.type,
                title: validate.title,
                description: data.description ? JSON.stringify(data.description) : null,
                note: JSON.stringify(validate.note),
                userId: user.id,
                tags: data?.tags?.map((t) => JSON.stringify(t)),
                folderId: folder?.id || data?.folderId,
                todos: data?.todos?.map((t) => JSON.stringify(t)),
                schedulerImportant: schedulerImportant(data?.schedulerType),
                schedulerType: data.schedulerType,
                schedulerDays: data.schedulerDays,
                schedulerEndTime: data.schedulerEndTime,
                schedulerStartTime: data.schedulerStartTime,
                isHang: data?.isHang,
                isSecure: data?.isSecure,
            }
        });

        return {
            id: save.id,
            createdAt: save.createdAt,
        }
    }

    async getAllItems(user: User) {
        const items = await Promise.all([this.getNote(user), this.getFolder(user)]);
        const flat = items.flat().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        return flat;
    }

    async getFolderAndContent(user: User, id: string) {
        const folder = await this.prismaService.folder.findFirst({
            where: {
                userId: user.id,
                id,
            }
        });

        const notes = await this.getNote(user, id);
        return {
            folder,
            notes,
        }
    }

    async getFolder(user: User, id?: string) {
        const folders = await this.prismaService.folder.findMany({
            where: {
                userId: user.id,
                ...(id && { id })
            },
            orderBy: [
                {
                    updatedAt: 'desc'
                }
            ]
        });

        return folders;
    }

    async updateFolder(user: User, data: Partial<Folder>, id: string) {
        const folder = await this.prismaService.folder.update({
            where: {
                userId: user.id,
                id,
            },
            data,
        })

        return folder;
    }

    async getNote(user: User, folderId: string = null) {
        const notes = await this.prismaService.note.findMany({
            where: {
                userId: user.id,
                AND: {
                    folderId,
                },
                NOT: {
                    type: "habits"
                }
            },
            orderBy: [
                {
                    isHang: 'desc'
                },
                {
                    updatedAt: 'desc'
                }
            ]
        });

        return parsingNotes(notes);
    }

    async getOneNote(user: User, id: string) {
        type Return = Note & { folderName?: string };
        let result = await this.prismaService.note.findFirst({
            where: {
                AND: [{ userId: user.id }, { id }]
            },
        });

        if (result?.folderId) {
            const folder = await this.prismaService.folder.findFirst({
                where: {
                    id: result.folderId,
                }
            });
            result = {
                ...result,
                folderName: folder.title,
            } as Return
        }

        if (!result) return null;

        return {
            ...result,
            note: JSON.parse(result?.note),
            description: JSON.parse(result?.description),
            tags: result?.tags?.map((t) => JSON.parse(t)),
            todos: result?.todos?.map((t) => JSON.parse(t)),
        };
    }

    async isSecureNote(user: User, id: string) {
        const result = await this.prismaService.note.findFirst({
            where: {
                AND: [{ userId: user.id }, { id }]
            }
        })

        if (!result) return false;

        return result?.isSecure;
    }

    async deleteNote(user: User, id: string) {
        const result = await this.prismaService.note.delete({
            where: {
                userId: user.id,
                id,
            }
        });
        return result
    }

    async deleteFolder(user: User, id: string) {
        const folder = await this.prismaService.folder.findFirst({ where: { id, userId: user.id } });
        if (!folder) {
            throw new HttpException("Folder not exist", HttpStatus.NOT_FOUND);
        }

        try {
            this.prismaService.$transaction([
                this.prismaService.$queryRaw(Prisma.raw(`
                    delete from public.note n where n."userId" = '${user.id}' and n."folderId" = '${id}'
                `)),
                this.prismaService.folder.delete({ where: { id, userId: user.id } })
            ])
        } catch (e: any) {
            throw new HttpException(e?.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return {
            folderId: id
        }
    }

    async hasPasswordNote(user: User) {
        const result = await this.prismaService.user.findFirst({
            where: {
                id: user.id,
            }
        })

        return Boolean(result.passwordNote)
    }

    async setPasswordNote(user: User, data: CreatePasswordNote) {
        const hashPassword = await bcrypt.hash(data.password, 10);
        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordNote: hashPassword
            }
        });
        return true;
    }

    async changePasswordNote(user: User, data: ChangePasswordNote) {
        const userFind = await this.prismaService.user.findFirst({
            where: {
                id: user.id
            }
        });
        if (!userFind.passwordNote) {
            throw new Error("Password not defined");
        }

        const matchPass = await bcrypt.compare(data["old-password"], userFind.passwordNote);
        if (!matchPass) {
            throw new Error("Password wrong!");
        }

        const hassPassword = await bcrypt.hash(data.password, 10);
        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordNote: hassPassword,
            }
        });
        return true;
    }

    async isPasswordNoteCorrect(user: User, data: CreatePasswordNote) {
        const result = await this.prismaService.user.findFirst({
            where: {
                id: user.id
            },
            select: {
                passwordNote: true
            }
        });

        if (!result.passwordNote) {
            throw new HttpException("Password Note has not been set yet", HttpStatus.NOT_ACCEPTABLE);
        }

        const match = await bcrypt.compare(data.password, result.passwordNote);
        return match;
    }

    async createTag(user: User, data: Tag) {
        const result = await this.prismaService.tag.create({
            data: {
                ...data,
                isNew: true,
                creatorId: user.id,
            }
        });
        return result;
    }

    async deleteTag(user: User, id: string) {
        const result = await this.prismaService.tag.delete({
            where: {
                creatorId: user.id,
                id,
            }
        });
        return result;
    }

    async getTags(user: User) {
        const result = await this.prismaService.tag.findMany({
            where: {
                OR: [
                    {
                        creatorId: user.id
                    },
                    {
                        creatorId: null,
                    },
                ]
            },
            orderBy: {
                text: "asc"
            }
        });

        return result;
    }

    async createTagMany(data: Tag[]) {
        const result = await this.prismaService.tag.createMany({
            data,
        });
        return result;
    }

    async removeTagNewFlag(id: string) {
        const result = await this.prismaService.tag.update({
            where: {
                id,
            },
            data: {
                isNew: false
            }
        });
        return result;
    }

    async updateNote(user: User, data: Partial<CreateNote>, id: string) {
        let folder;
        if (data?.newFolder?.title && !data?.folderId) {
            folder = await this.prismaService.folder.create({
                data: {
                    title: data.newFolder?.title,
                    userId: user.id,
                    type: "folder",
                }
            });
        }

        const oldNote = await this.prismaService.note.findFirst({
            where: {
                id,
            }
        });

        const save = await this.prismaService.note.update({
            where: {
                id,
                userId: user.id,
            },
            data: {
                type: data.type || oldNote.type,
                title: data?.title || oldNote.title,
                description: data?.description ? JSON.stringify(data?.description) : oldNote?.description,
                note: data?.note ? JSON.stringify(data?.note) : oldNote.note,
                tags: data?.tags ? data?.tags.map((t) => JSON.stringify(t)) : oldNote.tags,
                folderId: data?.folderId === "remove" ? null : folder?.id || data?.folderId || oldNote?.folderId,
                todos: data?.todos ? data?.todos.map((t) => JSON.stringify(t)) : oldNote.todos,
                schedulerImportant: schedulerImportant(data?.schedulerType),
                schedulerType: data?.schedulerType,
                schedulerDays: data.schedulerDays,
                schedulerEndTime: data.schedulerEndTime,
                schedulerStartTime: data.schedulerStartTime,
                isHang: data?.isHang === undefined ? oldNote.isHang : data.isHang,
                isSecure: data?.isSecure === undefined ? oldNote.isSecure : data?.isSecure,
            }
        });

        return {
            id: save.id,
            createdAt: save.createdAt,
        }
    }

    async addNotesToFolder({ folderId, user, noteIds }: { user: User, noteIds: string[], folderId: string }) {
        try {
            await this.prismaService.$transaction([
                this.prismaService.folder.update({
                    where: {
                        userId: user.id,
                        id: folderId
                    },
                    data: {
                        updatedAt: new Date().toISOString()
                    }
                }),
                this.prismaService.note.updateMany({
                    where: {
                        userId: user.id,
                        id: {
                            in: noteIds,
                        }
                    },
                    data: {
                        folderId
                    }
                }),
            ]);
            return folderId;
        } catch (e: any) {
            throw new HttpException(e?.message, HttpStatus.EXPECTATION_FAILED);
        }

    }

    async changeTodos(data: { user: User; noteId: string, todos: Todo[] }) {
        const note = await this.prismaService.note.findFirst({
            where: {
                userId: data.user.id,
                id: data.noteId,
            }
        });

        if (!note) {
            throw new HttpException("Can't find note!", HttpStatus.NOT_FOUND);
        }

        const update = await this.prismaService.note.update({
            where: {
                userId: data.user.id,
                id: data.noteId,
            },
            data: {
                todos: data.todos.map((t) => JSON.stringify(t)),
            }
        });

        return {
            ...update,
            todos: update.todos.map((t) => JSON.parse(t)),
        };
    }

    async resetTodoTimer(data: { noteId: string }) { // for debug only
        const note = await this.prismaService.note.findFirst({
            where: { id: data.noteId }
        });

        const todos = note.todos.map((t) => JSON.parse(t)) as Todo[];

        const update = await this.prismaService.note.update({
            where: { id: data.noteId },
            data: {
                ...note,
                todos: todos?.map((t) => JSON.stringify(({ ...t, timer: null }))),
            }
        });

        return {
            ...update,
            todos: update.todos.map((t) => JSON.parse(t)),
        };
    }
}