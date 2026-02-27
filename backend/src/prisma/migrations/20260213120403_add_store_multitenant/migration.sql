-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Characteristic" DROP CONSTRAINT "Characteristic_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Conditional" DROP CONSTRAINT "Conditional_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_storeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_storeId_fkey";

-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Characteristic" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Conditional" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "storeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characteristic" ADD CONSTRAINT "Characteristic_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conditional" ADD CONSTRAINT "Conditional_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
