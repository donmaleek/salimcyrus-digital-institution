-- CreateTable
CREATE TABLE "BookPurchase" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "paystackReference" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookDownloadGrant" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER NOT NULL DEFAULT 5,
    "lastDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookDownloadGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookPurchase_paystackReference_key" ON "BookPurchase"("paystackReference");

-- CreateIndex
CREATE INDEX "BookPurchase_bookSlug_email_idx" ON "BookPurchase"("bookSlug", "email");

-- CreateIndex
CREATE UNIQUE INDEX "BookDownloadGrant_tokenHash_key" ON "BookDownloadGrant"("tokenHash");

-- CreateIndex
CREATE INDEX "BookDownloadGrant_purchaseId_idx" ON "BookDownloadGrant"("purchaseId");

-- AddForeignKey
ALTER TABLE "BookPurchase" ADD CONSTRAINT "BookPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookDownloadGrant" ADD CONSTRAINT "BookDownloadGrant_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "BookPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

