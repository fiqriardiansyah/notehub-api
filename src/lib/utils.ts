import { Note } from "@prisma/client";

export const parsingNotes = (notes?: Note[]) => {
    return notes?.map((note) => ({
        ...note,
        note: note?.isSecure ? undefined : JSON.parse(note.note),
        tags: note?.tags?.map((t) => JSON.parse(t)),
        todos: note?.todos?.map((t) => JSON.parse(t)),
    }));
}