/*
  Warnings:

  - A unique constraint covering the columns `[productId,variationCode]` on the table `ProductVariation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "variationCode" INTEGER;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "colorSnapshot" TEXT,
ADD COLUMN     "priceSnapshot" DOUBLE PRECISION,
ADD COLUMN     "productNameSnapshot" TEXT,
ADD COLUMN     "sizeSnapshot" TEXT,
ADD COLUMN     "variationCodeSnapshot" INTEGER;

-- AlterTable
ALTER TABLE "StoreCounter" ADD COLUMN     "variationCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariation_productId_variationCode_key" ON "ProductVariation"("productId", "variationCode");
