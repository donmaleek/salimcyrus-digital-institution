-- AlterTable
ALTER TABLE "User" ADD COLUMN     "crmRole" TEXT NOT NULL DEFAULT 'customer';

-- CreateTable
CREATE TABLE "CrmOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL DEFAULT 'business',
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CrmOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmContact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "displayName" TEXT NOT NULL,
    "primaryEmail" TEXT,
    "normalizedEmail" TEXT,
    "primaryPhone" TEXT,
    "normalizedPhone" TEXT,
    "lifecycleStage" TEXT NOT NULL DEFAULT 'lead',
    "relationshipTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "score" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredChannel" TEXT,
    "emailConsent" BOOLEAN NOT NULL DEFAULT false,
    "whatsappConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentCapturedAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "organizationId" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "nextActionAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "contactId" TEXT,
    "opportunityId" TEXT,
    "type" TEXT NOT NULL,
    "direction" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "channel" TEXT,
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completionNote" TEXT,
    "assigneeId" TEXT,
    "contactId" TEXT,
    "opportunityId" TEXT,
    "recurringRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmPipeline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessLine" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmPipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CrmPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOpportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contactId" TEXT,
    "organizationId" TEXT,
    "ownerId" TEXT,
    "pipelineId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "businessLine" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "probability" INTEGER NOT NULL DEFAULT 0,
    "expectedCloseAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "nextActionAt" TIMESTAMP(3),
    "source" TEXT,
    "lossReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "contactId" TEXT,
    "assigneeId" TEXT,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmProduct" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "businessLine" TEXT NOT NULL,
    "description" TEXT,
    "priceMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "stockOnHand" INTEGER,
    "reorderLevel" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "contactId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'unfulfilled',
    "subtotalMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "deliveryMethod" TEXT,
    "shippingAddress" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitMinor" INTEGER NOT NULL,
    "totalMinor" INTEGER NOT NULL,

    CONSTRAINT "CrmOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmInventoryMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmInventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTransaction" (
    "id" TEXT NOT NULL,
    "externalReference" TEXT,
    "contactId" TEXT,
    "opportunityId" TEXT,
    "orderId" TEXT,
    "provider" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reconciliationStatus" TEXT NOT NULL DEFAULT 'unmatched',
    "businessLine" TEXT NOT NULL,
    "grossMinor" INTEGER NOT NULL,
    "feeMinor" INTEGER NOT NULL DEFAULT 0,
    "netMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "capacity" INTEGER,
    "priceMinor" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmEnrollment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attendance" INTEGER NOT NULL DEFAULT 0,
    "outcome" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CrmEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "businessLine" TEXT,
    "budgetMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmCampaignMember" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "respondedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "CrmCampaignMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmDonation" (
    "id" TEXT NOT NULL,
    "contactId" TEXT,
    "campaign" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" TEXT NOT NULL DEFAULT 'received',
    "restriction" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmGoal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "targetValue" DECIMAL(18,2) NOT NULL,
    "currentValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "businessLine" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmAuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmImportJob" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'preview',
    "fileName" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "duplicateRows" INTEGER NOT NULL DEFAULT 0,
    "mapping" JSONB,
    "errors" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CrmImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmIntegration" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "config" JSONB,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmOrganization_name_idx" ON "CrmOrganization"("name");

-- CreateIndex
CREATE INDEX "CrmOrganization_status_idx" ON "CrmOrganization"("status");

-- CreateIndex
CREATE INDEX "CrmContact_displayName_idx" ON "CrmContact"("displayName");

-- CreateIndex
CREATE INDEX "CrmContact_normalizedEmail_idx" ON "CrmContact"("normalizedEmail");

-- CreateIndex
CREATE INDEX "CrmContact_normalizedPhone_idx" ON "CrmContact"("normalizedPhone");

-- CreateIndex
CREATE INDEX "CrmContact_lifecycleStage_status_idx" ON "CrmContact"("lifecycleStage", "status");

-- CreateIndex
CREATE INDEX "CrmContact_ownerId_nextActionAt_idx" ON "CrmContact"("ownerId", "nextActionAt");

-- CreateIndex
CREATE INDEX "CrmActivity_contactId_occurredAt_idx" ON "CrmActivity"("contactId", "occurredAt");

-- CreateIndex
CREATE INDEX "CrmActivity_opportunityId_occurredAt_idx" ON "CrmActivity"("opportunityId", "occurredAt");

-- CreateIndex
CREATE INDEX "CrmTask_assigneeId_status_dueAt_idx" ON "CrmTask"("assigneeId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "CrmTask_contactId_idx" ON "CrmTask"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmPipelineStage_pipelineId_position_key" ON "CrmPipelineStage"("pipelineId", "position");

-- CreateIndex
CREATE INDEX "CrmOpportunity_pipelineId_stageId_idx" ON "CrmOpportunity"("pipelineId", "stageId");

-- CreateIndex
CREATE INDEX "CrmOpportunity_ownerId_status_nextActionAt_idx" ON "CrmOpportunity"("ownerId", "status", "nextActionAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmCase_caseNumber_key" ON "CrmCase"("caseNumber");

-- CreateIndex
CREATE INDEX "CrmCase_status_priority_dueAt_idx" ON "CrmCase"("status", "priority", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmProduct_sku_key" ON "CrmProduct"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CrmOrder_orderNumber_key" ON "CrmOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "CrmOrder_status_createdAt_idx" ON "CrmOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CrmInventoryMovement_productId_createdAt_idx" ON "CrmInventoryMovement"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmTransaction_externalReference_key" ON "CrmTransaction"("externalReference");

-- CreateIndex
CREATE INDEX "CrmTransaction_status_paidAt_idx" ON "CrmTransaction"("status", "paidAt");

-- CreateIndex
CREATE INDEX "CrmTransaction_reconciliationStatus_idx" ON "CrmTransaction"("reconciliationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CrmEnrollment_programId_contactId_key" ON "CrmEnrollment"("programId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmCampaignMember_campaignId_contactId_key" ON "CrmCampaignMember"("campaignId", "contactId");

-- CreateIndex
CREATE INDEX "CrmAuditEvent_entityType_entityId_createdAt_idx" ON "CrmAuditEvent"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmAuditEvent_actorId_createdAt_idx" ON "CrmAuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmIntegration_provider_key" ON "CrmIntegration"("provider");

-- CreateIndex
CREATE INDEX "CrmNotification_userId_readAt_createdAt_idx" ON "CrmNotification"("userId", "readAt", "createdAt");

-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CrmOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmPipelineStage" ADD CONSTRAINT "CrmPipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "CrmPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CrmOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "CrmPipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "CrmPipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCase" ADD CONSTRAINT "CrmCase_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCase" ADD CONSTRAINT "CrmCase_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOrder" ADD CONSTRAINT "CrmOrder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOrderItem" ADD CONSTRAINT "CrmOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CrmOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOrderItem" ADD CONSTRAINT "CrmOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CrmProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmInventoryMovement" ADD CONSTRAINT "CrmInventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CrmProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTransaction" ADD CONSTRAINT "CrmTransaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTransaction" ADD CONSTRAINT "CrmTransaction_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTransaction" ADD CONSTRAINT "CrmTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CrmOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmEnrollment" ADD CONSTRAINT "CrmEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CrmProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmEnrollment" ADD CONSTRAINT "CrmEnrollment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCampaignMember" ADD CONSTRAINT "CrmCampaignMember_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CrmCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCampaignMember" ADD CONSTRAINT "CrmCampaignMember_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDonation" ADD CONSTRAINT "CrmDonation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmAuditEvent" ADD CONSTRAINT "CrmAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmNotification" ADD CONSTRAINT "CrmNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
