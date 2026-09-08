-- DropIndex
DROP INDEX "BookPurchase_paystackReference_key";

-- AlterTable
ALTER TABLE "BookPurchase" DROP COLUMN "paystackReference",
ADD COLUMN     "externalReference" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'paystack';

-- CreateIndex
CREATE UNIQUE INDEX "BookPurchase_provider_externalReference_key" ON "BookPurchase"("provider", "externalReference");

