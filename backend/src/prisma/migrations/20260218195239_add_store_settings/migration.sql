-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "logo" TEXT,
    "storeName" TEXT,
    "fantasyName" TEXT,
    "document" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "allowProductWithoutSku" BOOLEAN NOT NULL DEFAULT false,
    "controlStock" BOOLEAN NOT NULL DEFAULT true,
    "allowSellZeroStock" BOOLEAN NOT NULL DEFAULT false,
    "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false,
    "receiptMessage" TEXT,
    "maxDiscountPercent" DOUBLE PRECISION,
    "defaultCardFee" DOUBLE PRECISION,
    "defaultCardCompensationDays" INTEGER,
    "catalogShowPrice" BOOLEAN NOT NULL DEFAULT true,
    "catalogShowStock" BOOLEAN NOT NULL DEFAULT false,
    "catalogShowVariations" BOOLEAN NOT NULL DEFAULT true,
    "catalogAllowDirectOrder" BOOLEAN NOT NULL DEFAULT false,
    "catalogWhatsapp" TEXT,
    "catalogAutoMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");

-- AddForeignKey
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
