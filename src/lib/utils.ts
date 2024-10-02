import { Note } from "@prisma/client";

const crypto = require('crypto');

// Generate a random token
export const generateToken = () => {
    return crypto.randomBytes(32).toString('hex'); // Generates a 64-character hex string
};

export const parsingNotes = (notes?: Note[]) => {
    return notes?.map((note) => ({
        ...note,
        note: note?.isSecure ? undefined : JSON.parse(note.note),
        description: JSON.parse(note?.description),
        tags: note?.tags?.map((t) => JSON.parse(t)),
        todos: note?.todos?.map((t) => JSON.parse(t)),
    }));
}