-- AlterTable
ALTER TABLE "ConditionalItem" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "ProductCharacteristic" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "storeId" TEXT;

-- CreateIndex
CREATE INDEX "Brand_storeId_idx" ON "Brand"("storeId");

-- CreateIndex
CREATE INDEX "Brand_storeId_id_idx" ON "Brand"("storeId", "id");

-- CreateIndex
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");

-- CreateIndex
CREATE INDEX "Category_storeId_id_idx" ON "Category"("storeId", "id");

-- CreateIndex
CREATE INDEX "Characteristic_storeId_idx" ON "Characteristic"("storeId");

-- CreateIndex
CREATE INDEX "Characteristic_storeId_id_idx" ON "Characteristic"("storeId", "id");

-- CreateIndex
CREATE INDEX "Client_storeId_idx" ON "Client"("storeId");

-- CreateIndex
CREATE INDEX "Client_storeId_id_idx" ON "Client"("storeId", "id");

-- CreateIndex
CREATE INDEX "Conditional_storeId_idx" ON "Conditional"("storeId");

-- CreateIndex
CREATE INDEX "Conditional_storeId_id_idx" ON "Conditional"("storeId", "id");

-- CreateIndex
CREATE INDEX "ConditionalItem_storeId_idx" ON "ConditionalItem"("storeId");

-- CreateIndex
CREATE INDEX "ConditionalItem_storeId_id_idx" ON "ConditionalItem"("storeId", "id");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_storeId_id_idx" ON "Product"("storeId", "id");

-- CreateIndex
CREATE INDEX "ProductCharacteristic_storeId_idx" ON "ProductCharacteristic"("storeId");

-- CreateIndex
CREATE INDEX "ProductCharacteristic_storeId_id_idx" ON "ProductCharacteristic"("storeId", "id");

-- CreateIndex
CREATE INDEX "ProductVariation_storeId_idx" ON "ProductVariation"("storeId");

-- CreateIndex
CREATE INDEX "ProductVariation_storeId_id_idx" ON "ProductVariation"("storeId", "id");

-- CreateIndex
CREATE INDEX "Sale_storeId_idx" ON "Sale"("storeId");

-- CreateIndex
CREATE INDEX "Sale_storeId_id_idx" ON "Sale"("storeId", "id");

-- CreateIndex
CREATE INDEX "SaleItem_storeId_idx" ON "SaleItem"("storeId");

-- CreateIndex
CREATE INDEX "SaleItem_storeId_id_idx" ON "SaleItem"("storeId", "id");

-- CreateIndex
CREATE INDEX "StoreCounter_storeId_idx" ON "StoreCounter"("storeId");

-- CreateIndex
CREATE INDEX "StoreCounter_storeId_id_idx" ON "StoreCounter"("storeId", "id");

-- CreateIndex
CREATE INDEX "StoreSettings_storeId_idx" ON "StoreSettings"("storeId");

-- CreateIndex
CREATE INDEX "StoreSettings_storeId_id_idx" ON "StoreSettings"("storeId", "id");

-- CreateIndex
CREATE INDEX "Transaction_storeId_idx" ON "Transaction"("storeId");

-- CreateIndex
CREATE INDEX "Transaction_storeId_id_idx" ON "Transaction"("storeId", "id");

-- CreateIndex
CREATE INDEX "User_storeId_idx" ON "User"("storeId");

-- CreateIndex
CREATE INDEX "User_storeId_id_idx" ON "User"("storeId", "id");

-- AddForeignKey
ALTER TABLE "ProductCharacteristic" ADD CONSTRAINT "ProductCharacteristic_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariation" ADD CONSTRAINT "ProductVariation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalItem" ADD CONSTRAINT "ConditionalItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
