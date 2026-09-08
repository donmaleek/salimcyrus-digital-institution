-- CreateTable
CREATE TABLE "Teaching" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceKes" INTEGER NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "videoFileName" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "durationSeconds" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teaching_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingPurchase" (
    "id" TEXT NOT NULL,
    "teachingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "externalReference" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teaching_slug_key" ON "Teaching"("slug");

-- CreateIndex
CREATE INDEX "Teaching_status_category_idx" ON "Teaching"("status", "category");

-- CreateIndex
CREATE INDEX "TeachingPurchase_teachingId_userId_idx" ON "TeachingPurchase"("teachingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingPurchase_provider_externalReference_key" ON "TeachingPurchase"("provider", "externalReference");

-- AddForeignKey
ALTER TABLE "TeachingPurchase" ADD CONSTRAINT "TeachingPurchase_teachingId_fkey" FOREIGN KEY ("teachingId") REFERENCES "Teaching"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingPurchase" ADD CONSTRAINT "TeachingPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
