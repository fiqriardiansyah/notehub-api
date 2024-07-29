import { Injectable } from "@nestjs/common";
import { Note, Prisma, Tag, User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { PrismaService } from "src/common/prisma.service";
import { ValidationService } from "src/common/validation.service";
import { ChangePasswordNote, CreateNote, CreatePasswordNote } from "./note.models";
import { NoteValidation } from "./note.validation";

@Injectable()
export class NoteService {
    constructor(private prismaService: PrismaService, private validationService: ValidationService) { }

    async createNote(user: User, data: CreateNote) {
        const validate = this.validationService.validate(NoteValidation.CREATE, data) as CreateNote;

        const save = await this.prismaService.note.create({
            data: {
                title: validate.title,
                note: JSON.stringify(validate.note),
                userId: user.id,
                type: data.type,
                isSecure: data?.isSecure,
                tags: data?.tags.map((t) => JSON.stringify(t)),
            }
        });

        return {
            id: save.id,
            createdAt: save.createdAt,
        }
    }

    async getNote(user: User) {
        const notes = await this.prismaService.note.findMany({
            where: {
                userId: user.id,
            }
        });

        console.log(notes);

        return notes.map((note) => ({
            ...note,
            note: note?.isSecure ? undefined : JSON.parse(note.note),
            tags: note?.tags?.map((t) => JSON.parse(t))
        }));
    }

    async getOneNote(user: User, id: string) {
        const result = await this.prismaService.note.findFirst({
            where: {
                AND: [{ userId: user.id }, { id }]
            }
        })

        if (!result) return null;

        return {
            ...result,
            note: JSON.parse(result?.note),
            tags: result?.tags?.map((t) => JSON.parse(t)),
        };
    }

    async deleteNote(id: string) {
        const result = await this.prismaService.note.delete({
            where: {
                id,
            }
        });
        return result
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

    async deleteTag(id: string) {
        const result = await this.prismaService.tag.delete({
            where: {
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

        console.log(result, user);

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

    async updateNote(user: User, data: CreateNote, id: string) {
        const validate = this.validationService.validate(NoteValidation.CREATE, data) as CreateNote;

        const save = await this.prismaService.note.update({
            where: {
                id,
                userId: user.id,
            },
            data: {
                title: validate.title,
                note: JSON.stringify(validate.note),
                type: data.type,
                isSecure: data?.isSecure,
                tags: data?.tags.map((t) => JSON.stringify(t)),
            }
        });

        return {
            id: save.id,
            createdAt: save.createdAt,
        }
    }
}