-- CreateTable
CREATE TABLE "habitshistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "completedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habitshistory_pkey" PRIMARY KEY ("id")
);
