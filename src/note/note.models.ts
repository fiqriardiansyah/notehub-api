import { Tag } from "@prisma/client";

export class CreateNote {
    title: string;
    type: string; // freetext
    note?: {
        time: number;
        blocks: any[];
        version: string;
    };
    isSecure?: boolean;
    tags?: string[]
}

export class CreatePasswordNote {
    password: string;
}

export class ChangePasswordNote {
    password: string;
    "old-password": string;
}