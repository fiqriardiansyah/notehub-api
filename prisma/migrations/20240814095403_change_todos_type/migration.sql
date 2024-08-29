/*
  Warnings:

  - The `todos` column on the `note` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "note" DROP COLUMN "todos",
ADD COLUMN     "todos" TEXT[];
