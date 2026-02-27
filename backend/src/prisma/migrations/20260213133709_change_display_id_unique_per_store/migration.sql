/*
  Warnings:

  - A unique constraint covering the columns `[storeId,displayId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_displayId_key";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "displayId" DROP DEFAULT;
DROP SEQUENCE "Product_displayId_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_displayId_key" ON "Product"("storeId", "displayId");
