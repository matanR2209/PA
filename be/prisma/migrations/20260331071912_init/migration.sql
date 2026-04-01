-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'idea',
    "category" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "captureId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "captureId" TEXT NOT NULL,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptureLabel" (
    "captureId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "CaptureLabel_pkey" PRIMARY KEY ("captureId","labelId")
);

-- CreateIndex
CREATE INDEX "Capture_category_idx" ON "Capture"("category");

-- CreateIndex
CREATE INDEX "Capture_createdAt_idx" ON "Capture"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptureLabel" ADD CONSTRAINT "CaptureLabel_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptureLabel" ADD CONSTRAINT "CaptureLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
