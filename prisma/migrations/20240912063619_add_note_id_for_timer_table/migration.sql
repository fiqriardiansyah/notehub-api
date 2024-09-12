/*
  Warnings:

  - Added the required column `noteId` to the `timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "timer" ADD COLUMN     "noteId" TEXT NOT NULL;
