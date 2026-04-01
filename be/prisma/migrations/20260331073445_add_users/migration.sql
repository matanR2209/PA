/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Label` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Label` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Label_name_key";

-- AlterTable
ALTER TABLE "Capture" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Capture_userId_idx" ON "Capture"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_userId_name_key" ON "Label"("userId", "name");

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
