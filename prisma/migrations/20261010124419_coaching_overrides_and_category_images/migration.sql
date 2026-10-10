-- CreateTable
CREATE TABLE "CoachingOfferOverride" (
    "id" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "priceKes" INTEGER,
    "priceUsd" INTEGER,
    "duration" TEXT,
    "tagline" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingOfferOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingCategoryImage" (
    "id" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingCategoryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachingOfferOverride_offerName_key" ON "CoachingOfferOverride"("offerName");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingCategoryImage_categorySlug_key" ON "CoachingCategoryImage"("categorySlug");

