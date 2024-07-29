-- AlterTable
ALTER TABLE "note" ADD COLUMN     "isSecure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[];
