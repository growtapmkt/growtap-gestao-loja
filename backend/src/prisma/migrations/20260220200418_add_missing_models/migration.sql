-- CreateTable
CREATE TABLE "CatalogConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogConfig_storeId_idx" ON "CatalogConfig"("storeId");

-- CreateIndex
CREATE INDEX "CatalogConfig_storeId_id_idx" ON "CatalogConfig"("storeId", "id");

-- CreateIndex
CREATE INDEX "Banner_storeId_idx" ON "Banner"("storeId");

-- CreateIndex
CREATE INDEX "Banner_storeId_id_idx" ON "Banner"("storeId", "id");

-- AddForeignKey
ALTER TABLE "CatalogConfig" ADD CONSTRAINT "CatalogConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
