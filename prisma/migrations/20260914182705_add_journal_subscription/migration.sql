-- CreateTable
CREATE TABLE "JournalSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalSubscription_userId_expiresAt_idx" ON "JournalSubscription"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "JournalSubscription_provider_externalReference_key" ON "JournalSubscription"("provider", "externalReference");

-- AddForeignKey
ALTER TABLE "JournalSubscription" ADD CONSTRAINT "JournalSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

