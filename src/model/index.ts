import { Timer } from "@prisma/client";
import { Address } from "nodemailer/lib/mailer";

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
