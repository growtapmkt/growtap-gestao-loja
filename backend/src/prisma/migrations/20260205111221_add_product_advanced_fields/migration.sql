-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "catalogMinStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "controlStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "isCombo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFractional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minStockQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profitAmount" DOUBLE PRECISION,
ADD COLUMN     "profitPercent" DOUBLE PRECISION,
ADD COLUMN     "receiptMessage" TEXT,
ADD COLUMN     "showInCatalog" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PRODUCT';

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "variationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "ProductVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
