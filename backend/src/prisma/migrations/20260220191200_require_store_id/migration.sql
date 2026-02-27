/*
  Warnings:

  - Made the column `storeId` on table `ConditionalItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storeId` on table `ProductCharacteristic` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storeId` on table `ProductVariation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storeId` on table `SaleItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ConditionalItem" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductCharacteristic" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariation" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "storeId" SET NOT NULL;
