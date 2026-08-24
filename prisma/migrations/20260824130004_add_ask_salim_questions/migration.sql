-- CreateTable
CREATE TABLE "AskSalimQuestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "context" TEXT,
    "askerName" TEXT,
    "askerEmail" TEXT,
    "publicationPreference" TEXT NOT NULL DEFAULT 'anonymous',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AskSalimQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AskSalimQuestion_slug_key" ON "AskSalimQuestion"("slug");

-- CreateIndex
CREATE INDEX "AskSalimQuestion_status_publishedAt_idx" ON "AskSalimQuestion"("status", "publishedAt");

