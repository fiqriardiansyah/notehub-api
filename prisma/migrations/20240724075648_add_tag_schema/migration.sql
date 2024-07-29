-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "creatorId" TEXT,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);
