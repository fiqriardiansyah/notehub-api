import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Collaboration, Folder, Note, Prisma, Tag, User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { PrismaService } from "src/common/prisma.service";
import { ValidationService } from "src/common/validation.service";
import { generateToken, parsingNotes } from "src/lib/utils";
import { ChangePasswordNote, CreateNote, CreatePasswordNote, Todo } from "./note.models";
import { NoteValidation } from "./note.validation";
import { BucketService } from "src/bucket/bucket.service";

const schedulerImportant = (schedulerType?: "day" | "weekly" | "monthly") => {
    if (!schedulerType) return null;
    if (schedulerType === "day") return 1;
    if (schedulerType === "weekly") return 2;
    if (schedulerType === "monthly") return 3;
}

@Injectable()
export class NoteService {
    constructor(private prismaService: PrismaService, private validationService: ValidationService, private bucketService: BucketService) { }

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

        let filesUrl = [];
        let imagesUrl = [];

        if (data.files?.length) {
            const files = data?.files?.map((file) => {
                const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
                return this.bucketService.uploadFile({
                    blob: fileBuffer,
                    contentType: file.contentType,
                    name: file.name,
                });
            });
            filesUrl = (await Promise.all(files)).map((url, i) => JSON.stringify({
                url,
                name: data?.files[i].name,
                sizeInMb: data?.files[i].sizeInMb,
            }));
        }

        if (data.images?.length) {
            const images = data?.images?.map((file) => {
                const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
                return this.bucketService.uploadFile({
                    blob: fileBuffer,
                    contentType: file.contentType,
                    name: file.name,
                });
            });
            imagesUrl = (await Promise.all(images)).map((url, i) => JSON.stringify({
                url,
                name: data?.images[i].name,
                sizeInMb: data?.images[i].sizeInMb,
            }));
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
                filesUrl,
                imagesUrl,
            }
        });

        return {
            id: save.id,
            createdAt: save.createdAt,
        }
    }

    async getAllItems(user: User, order: string = "desc") {
        const items = await Promise.all([this.getNote(user), this.getFolder(user)]);
        const flat = items.flat().sort((a, b) => {
            if (order === "asc") {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            }
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        }).sort((a: any, b: any) => a?.isHang === b?.isHang ? 0 : (a?.isHang ? -1 : 1));
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
        type Return = Note & { folderName?: string, role: string };

        let result = (await this.prismaService.$queryRaw(Prisma.raw(`
            select n.*, c."role" from public.note n left join public.collaboration c on n.id = c."noteId" 
            where n.id = '${id}' and 
            (n."userId" = '${user.id}' or c."userId" = '${user.id}')
        `)))[0] as Note & { role?: any };

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

        if (!result) {
            throw new HttpException("Resource you trying to access can not found", HttpStatus.NOT_FOUND);
        };

        return {
            ...result,
            role: result?.userId === user.id ? null : result.role,
            note: JSON.parse(result?.note),
            description: JSON.parse(result?.description),
            tags: result?.tags?.map((t) => JSON.parse(t)),
            todos: result?.todos?.map((t) => JSON.parse(t)),
            filesUrl: result?.filesUrl?.map((t) => JSON.parse(t)),
            imagesUrl: result?.imagesUrl?.map((t) => JSON.parse(t)),
        };
    }

    async isSecureNote(user: User, id: string) {
        const result = await this.prismaService.note.findFirst({
            where: {
                AND: [{ userId: user.id }, { id }]
            }
        });

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
        return "Password note has been created!";
    }

    async changePasswordNote(user: User, data: ChangePasswordNote) {
        const userFind = await this.prismaService.user.findFirst({
            where: {
                id: user.id
            }
        });

        if (!userFind.passwordNote) {
            throw new HttpException("You havent set a password for secure note yet", HttpStatus.BAD_REQUEST);
        }

        const matchPass = await bcrypt.compare(data["old-password"], userFind.passwordNote);
        if (!matchPass) {
            throw new HttpException("Wrong password", HttpStatus.BAD_REQUEST);
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
        return "Password changed";
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
        try {
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

            const collaboration = (await this.prismaService.$queryRaw(Prisma.raw(`
                select * from public.collaboration c where c."noteId" = '${id}' and c."userId" = '${user.id}';
            `)))[0] as Collaboration;

            if (collaboration?.role === 'viewer') {
                throw new HttpException("You are not allowed to edit this project", HttpStatus.BAD_REQUEST);
            }

            const oldNote = (await this.prismaService.$queryRaw(Prisma.raw(`
                select n.* from public.note n left join public.collaboration c on c."noteId" = n.id
                where n.id = '${id}' and (n."userId" = '${user.id}' or (c."userId" = '${user.id}' and c."role" = 'editor'))
            `)))[0] as Note;

            if (oldNote) {

                let filesUrl = data?.files?.filter((fl) => fl?.url).map((fl) => JSON.stringify(fl));
                let imagesUrl = data?.images?.filter((img) => img?.url).map((img) => JSON.stringify(img));

                if (data.files?.length) {
                    const files = data?.files?.map((file) => {
                        if (file?.url) return null;
                        const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
                        return this.bucketService.uploadFile({
                            blob: fileBuffer,
                            contentType: file.contentType,
                            name: file.name,
                        });
                    }).filter(Boolean);

                    const result = (await Promise.all(files)).map((url, i) => JSON.stringify({
                        url,
                        name: data?.files[i].name,
                        sizeInMb: data?.files[i].sizeInMb,
                    }));

                    filesUrl = [...filesUrl, ...result];
                }

                if (data.images?.length) {
                    const images = data?.images?.map((file) => {
                        if (file?.url) return null;
                        const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
                        return this.bucketService.uploadFile({
                            blob: fileBuffer,
                            contentType: file.contentType,
                            name: file.name,
                        });
                    }).filter(Boolean);

                    const result = (await Promise.all(images)).map((url, i) => JSON.stringify({
                        url,
                        name: data?.images[i].name,
                        sizeInMb: data?.images[i].sizeInMb,
                    }));

                    imagesUrl = [...imagesUrl, ...result];
                }

                const save = await this.prismaService.note.update({
                    where: {
                        id: oldNote.id,
                    },
                    data: {
                        updatedBy: user.name,
                        type: data.type || oldNote.type,
                        title: data?.title || oldNote.title,
                        description: data?.description ? JSON.stringify(data?.description) : oldNote?.description,
                        note: data?.note ? JSON.stringify(data?.note) : oldNote.note,
                        tags: data?.tags ? data?.tags.map((t) => JSON.stringify(t)) : (oldNote?.tags || []),
                        folderId: data?.folderId === "remove" ? null : folder?.id || data?.folderId || oldNote?.folderId,
                        todos: data?.todos ? data?.todos.map((t) => JSON.stringify(t)) : (oldNote?.todos || []),
                        schedulerImportant: schedulerImportant(data?.schedulerType),
                        schedulerType: data?.schedulerType,
                        schedulerDays: data.schedulerDays,
                        schedulerEndTime: data.schedulerEndTime,
                        schedulerStartTime: data.schedulerStartTime,
                        isHang: data?.isHang === undefined ? oldNote?.isHang : data.isHang,
                        isSecure: data?.isSecure === undefined ? oldNote?.isSecure : data?.isSecure,
                        imagesUrl,
                        filesUrl,
                    }
                });

                if (data?.isSecure) {
                    await this.prismaService.$queryRaw(Prisma.raw(`
                        delete from public.collaboration c where c."noteId" = '${oldNote.id}'
                        `));
                    await this.prismaService.$queryRaw(Prisma.raw(`
                        delete from public.invitation i where i."noteId" = '${oldNote.id}'
                        `));
                }

                const shareLink = await this.prismaService.share.findFirst({
                    where: {
                        noteId: oldNote.id,
                    }
                });

                if (shareLink) {
                    await this.prismaService.share.update({
                        where: { id: shareLink.id },
                        data: { valid: !data?.isSecure }
                    });
                }

                return {
                    id: save.id,
                    createdAt: save.createdAt,
                }
            }

            throw new HttpException("Can't find the note", HttpStatus.NOT_FOUND);

        } catch (e) {
            throw new HttpException(e?.message, HttpStatus.INTERNAL_SERVER_ERROR)
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
        const note = (await this.prismaService.$queryRaw(Prisma.raw(`
            select n.* from public.note n left join public.collaboration c on n.id = c."noteId" 
            where n.id = '${data.noteId}' and 
            (n."userId" = '${data.user.id}' or c."userId" = '${data.user.id}')
        `)))[0] as { id: string }

        if (!note) {
            throw new HttpException("Can't find note!", HttpStatus.NOT_FOUND);
        }

        const update = await this.prismaService.note.update({
            where: {
                id: data.noteId,
            },
            data: {
                todos: data.todos.map((t) => JSON.stringify(t)),
                updatedBy: data.user.name,
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
                todos: todos?.map((t) => JSON.stringify(({ ...t, timer: null, attach: [] }))),
            }
        });

        return {
            ...update,
            todos: update.todos.map((t) => JSON.parse(t)),
        };
    }

    async getOnlyTodos(user: User, noteId: string) {
        const notes = (await this.prismaService.$queryRaw(Prisma.raw(`
            select n.* from public.note n left join public.collaboration c on n."id" = c."noteId"
            where n."id" = '${noteId}' and (n."userId" = '${user.id}' or c."userId" = '${user.id}')
        `)))[0] as Note;
        return {
            todos: notes?.todos?.map((t) => JSON.parse(t)),
        }
    }

    async generateShareLink(user: User, noteId: string) {
        const generateString = generateToken();
        const create = await this.prismaService.share.create({
            data: {
                link: generateString,
                noteId,
                userId: user.id
            }
        });
        return create;
    }

    async getShareLink(user: User, noteId: string) {
        const shareLink = await this.prismaService.share.findFirst({
            where: {
                userId: user.id,
                noteId,
            }
        });
        return shareLink
    }

    async deleteShareLink(user: User, id: string) {
        const deleteShare = await this.prismaService.share.delete({
            where: { id }
        });
        return deleteShare;
    }

    async getNoteFromShareLink(link: string) {
        type ReturnType = Pick<Note, "title" | "note" | "updatedAt" | "updatedBy" | "todos" | "type" | "filesUrl" | "imagesUrl"> & Pick<User, "name" | "image"> & {
            ownerId: string;
            collaborators?: Pick<User, "name" | "image">[];
        }

        const shareLink = await this.prismaService.share.findFirst({ where: { link } });
        if (!shareLink) {
            throw new HttpException("Ooops, we found nothing :(", HttpStatus.NOT_FOUND);
        }

        if (!shareLink.valid) {
            throw new HttpException("Shared link not valid", HttpStatus.BAD_REQUEST);
        }

        const note = (await this.prismaService.$queryRaw(Prisma.raw(`
            select 
                n."title", n."note", n."updatedAt", n."todos", n."updatedBy", n."filesUrl", n."imagesUrl", n."type", u."name", u."image", u."id" as "ownerId"
            from public.note n join public.user u on n."userId" = u."id" where n."id" = '${shareLink.noteId}'
        `)))[0] as ReturnType;

        if (!note) {
            throw new HttpException("Ooops, we found nothing :(", HttpStatus.NOT_FOUND);
        }

        const collaborators = await this.prismaService.$queryRaw(Prisma.raw(`
            select u."name", u."image" from public."user" u join public."collaboration" c on u."id" = c."userId"
            where c."noteId" = '${shareLink.noteId}'
        `)) as Pick<User, "name" | "image">[]

        return {
            ...note,
            note: JSON.parse(note.note),
            todos: note?.todos?.map((t) => JSON.parse(t)),
            filesUrl: note?.filesUrl?.map((t) => JSON.parse(t)),
            imagesUrl: note?.imagesUrl?.map((t) => JSON.parse(t)),
            collaborators,
        } as ReturnType;
    }

    async getIdNoteFromLink(user: User, link: string) {
        const shareLink = await this.prismaService.share.findFirst({
            where: {
                userId: user.id,
                link,
            }
        });
        if (!shareLink) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }
        return shareLink.noteId;
    }
}