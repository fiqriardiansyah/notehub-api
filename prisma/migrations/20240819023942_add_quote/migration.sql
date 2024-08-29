-- CreateTable
CREATE TABLE "UserQuote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quoteId" INTEGER NOT NULL,

    CONSTRAINT "UserQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
