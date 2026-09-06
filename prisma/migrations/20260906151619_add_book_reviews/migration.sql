-- CreateTable
CREATE TABLE "BookReview" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatedAt" TIMESTAMP(3),

    CONSTRAINT "BookReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookReview_purchaseId_key" ON "BookReview"("purchaseId");

-- CreateIndex
CREATE INDEX "BookReview_bookSlug_status_idx" ON "BookReview"("bookSlug", "status");

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "BookPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

