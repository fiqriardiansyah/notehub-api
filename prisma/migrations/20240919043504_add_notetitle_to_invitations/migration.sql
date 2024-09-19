/*
  Warnings:

  - Added the required column `noteTitle` to the `invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "noteTitle" TEXT NOT NULL;
