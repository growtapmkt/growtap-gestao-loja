/*
  Warnings:

  - A unique constraint covering the columns `[catalogSlug]` on the table `StoreSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "catalogActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "catalogContactEmail" TEXT,
ADD COLUMN     "catalogFooterMessage" TEXT,
ADD COLUMN     "catalogInstagram" TEXT,
ADD COLUMN     "catalogLogo" TEXT,
ADD COLUMN     "catalogSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_catalogSlug_key" ON "StoreSettings"("catalogSlug");
