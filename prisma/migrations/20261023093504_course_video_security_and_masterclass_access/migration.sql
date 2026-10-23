-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "accessWindowDays" INTEGER;

-- AlterTable
ALTER TABLE "CourseLesson" ADD COLUMN     "videoFileName" TEXT,
ADD COLUMN     "videoProcessingStatus" TEXT NOT NULL DEFAULT 'ready';

-- CreateTable
CREATE TABLE "CourseStreamEvent" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseStreamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseStreamEvent_enrollmentId_createdAt_idx" ON "CourseStreamEvent"("enrollmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "CourseStreamEvent" ADD CONSTRAINT "CourseStreamEvent_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

