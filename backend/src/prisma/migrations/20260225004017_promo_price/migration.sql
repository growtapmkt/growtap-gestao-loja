-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPromotionalPrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promotionalDiscountPercentage" DOUBLE PRECISION,
ADD COLUMN     "promotionalPrice" DOUBLE PRECISION,
ALTER COLUMN "sku" DROP NOT NULL;
