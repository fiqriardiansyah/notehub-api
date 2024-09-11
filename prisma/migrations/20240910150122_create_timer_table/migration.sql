-- CreateTable
CREATE TABLE "timer" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" TEXT,
    "endTime" TIMESTAMP(3),
    "isEnd" BOOLEAN DEFAULT false,
    "autoComplete" BOOLEAN DEFAULT false,

    CONSTRAINT "timer_pkey" PRIMARY KEY ("id")
);
