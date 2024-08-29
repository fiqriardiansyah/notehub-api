-- AlterTable
ALTER TABLE "note" ADD COLUMN     "description" TEXT,
ADD COLUMN     "schedulerDays" TEXT[],
ADD COLUMN     "schedulerEndTime" TIMESTAMP(3),
ADD COLUMN     "schedulerStartTime" TIMESTAMP(3),
ADD COLUMN     "schedulerType" TEXT;
