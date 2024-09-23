import { Note, Timer } from "@prisma/client";

export class BaseResponse<T = any> {
    data?: T;
    error?: any;
}

export class Todo {
    id: string;
    content: any;
    isCheck: boolean;
    checkedAt: any;
    timer?: Timer;
}

export class InvitationData {
    email: string;
    role: string;
    noteId: string;
    noteTitle: string;
}

export type CollaborateProject = Pick<Note, "id" | "title" | "note" | "type" | "todos" | "isHang" | "tags" | "updatedAt" | "isSecure">
    & Pick<InvitationData, "role">
    & {
        ownerId: string;
        ownerName: string;
        ownerImage: string;
    }