import { z } from "zod";

export class NoteValidation {
    static readonly CREATE = z.object({
        title: z.string().min(1),
        note: z.object({
            time: z.number(),
            blocks: z.any().array(),
            version: z.string(),
        }).optional(),
        type: z.string(),
        isSecure: z.boolean().optional(),
        tags: z.array(z.any()).optional(),
    });
    static readonly CREATE_PASS_NOTE = z.object({
        password: z.string().min(5),
    });
    static readonly UPDATE_PASS_NOTE = z.object({
        password: z.string().min(5),
        "old-password": z.string().min(5),
    });
}