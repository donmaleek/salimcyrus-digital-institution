ALTER TABLE "JournalEntry"
ADD COLUMN "coverImageData" BYTEA,
ADD COLUMN "coverImageMime" TEXT,
ADD COLUMN "coverImageAlt" TEXT,
ADD COLUMN "coverImageCaption" TEXT;
