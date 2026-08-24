-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "amountKobo" INTEGER,
ADD COLUMN     "paystackReference" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paystackReference_key" ON "Booking"("paystackReference");

