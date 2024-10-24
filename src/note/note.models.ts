import { Tag, Timer } from "@prisma/client";

export class Todo {
    id: string;
    content: any;
    isCheck: boolean;
    checkedAt: any;
    timer?: Timer
}

export class CreateNote {
    title: string;
    type: string; // freetext
    note?: {
        time: number;
        blocks: any[];
        version: string;
    };
    isSecure?: boolean;
    tags?: string[];
    isHang?: boolean;
    folderId?: string;
    newFolder?: {
        title: string;
    }
    todos?: Todo[];
    description?: {
        time: number;
        blocks: any[];
        version: string;
    };
    schedulerType?: "day" | "weekly" | "monthly";
    schedulerDays?: string[];
    schedulerStartTime?: string;
    schedulerEndTime?: string;
    schedulerImportant?: number;
    files?: { base64: string; name: string; contentType: string, sizeInMb: string; url?: string }[];
    images?: { base64: string; name: string; contentType: string, sizeInMb: string; url?: string }[];
}

export class CreatePasswordNote {
    password: string;
}

export class ChangePasswordNote {
    password: string;
    "old-password": string;
}

export class AddNoteToFolder {
    noteIds: string[];
    folderId: string;
}