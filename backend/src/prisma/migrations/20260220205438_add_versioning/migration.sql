-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
