CREATE TABLE "Course" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'course',
  "category" TEXT NOT NULL,
  "level" TEXT NOT NULL DEFAULT 'all-levels',
  "priceKes" INTEGER NOT NULL,
  "priceUsd" INTEGER NOT NULL,
  "thumbnailUrl" TEXT,
  "trailerUrl" TEXT,
  "outcomes" TEXT[] NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CourseSection" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "position" INTEGER NOT NULL,
  CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CourseLesson" (
  "id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "videoUrl" TEXT,
  "durationSeconds" INTEGER,
  "position" INTEGER NOT NULL,
  "isPreview" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'published',
  CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CourseEnrollment" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'admin',
  "externalReference" TEXT NOT NULL,
  "amountMinor" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'KES',
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "lastLessonId" TEXT,
  CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CourseLessonProgress" (
  "id" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "lastPositionSeconds" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseLessonProgress_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PaymentClaim" ADD COLUMN "courseId" TEXT;
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_status_kind_category_idx" ON "Course"("status", "kind", "category");
CREATE UNIQUE INDEX "CourseSection_courseId_position_key" ON "CourseSection"("courseId", "position");
CREATE UNIQUE INDEX "CourseLesson_sectionId_position_key" ON "CourseLesson"("sectionId", "position");
CREATE UNIQUE INDEX "CourseEnrollment_courseId_userId_key" ON "CourseEnrollment"("courseId", "userId");
CREATE UNIQUE INDEX "CourseEnrollment_provider_externalReference_key" ON "CourseEnrollment"("provider", "externalReference");
CREATE INDEX "CourseEnrollment_userId_enrolledAt_idx" ON "CourseEnrollment"("userId", "enrolledAt");
CREATE UNIQUE INDEX "CourseLessonProgress_enrollmentId_lessonId_key" ON "CourseLessonProgress"("enrollmentId", "lessonId");
CREATE INDEX "CourseLessonProgress_lessonId_idx" ON "CourseLessonProgress"("lessonId");
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseLessonProgress" ADD CONSTRAINT "CourseLessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseLessonProgress" ADD CONSTRAINT "CourseLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
