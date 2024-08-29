/*
  Warnings:

  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Quote";

-- DropTable
DROP TABLE "UserQuote";

-- CreateTable
CREATE TABLE "userquote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quoteId" INTEGER NOT NULL,

    CONSTRAINT "userquote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);
