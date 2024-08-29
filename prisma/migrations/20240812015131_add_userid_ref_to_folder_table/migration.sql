/*
  Warnings:

  - Added the required column `userId` to the `folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
