-- AlterTable
ALTER TABLE "Capture" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT;

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "captureId" TEXT NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionItem_captureId_idx" ON "ActionItem"("captureId");

-- CreateIndex
CREATE INDEX "ActionItem_status_idx" ON "ActionItem"("status");

-- CreateIndex
CREATE INDEX "Capture_priority_idx" ON "Capture"("priority");

-- CreateIndex
CREATE INDEX "Capture_dueDate_idx" ON "Capture"("dueDate");

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
