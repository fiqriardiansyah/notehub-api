-- AlterTable
ALTER TABLE "note" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "folder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);
