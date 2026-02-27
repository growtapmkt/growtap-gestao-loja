/*
  Warnings:

  - A unique constraint covering the columns `[storeId,productCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productCode" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "productPadding" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "productPrefix" TEXT NOT NULL DEFAULT 'PROD';

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_productCode_key" ON "Product"("storeId", "productCode");
