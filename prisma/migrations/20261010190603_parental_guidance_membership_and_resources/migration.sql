-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Book';

-- AlterTable
ALTER TABLE "CourseLesson" ADD COLUMN     "resourceFileName" TEXT,
ADD COLUMN     "resourceLabel" TEXT;

-- CreateTable
CREATE TABLE "ParentMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParentMembership_userId_expiresAt_idx" ON "ParentMembership"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ParentMembership_provider_externalReference_key" ON "ParentMembership"("provider", "externalReference");

-- AddForeignKey
ALTER TABLE "ParentMembership" ADD CONSTRAINT "ParentMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

