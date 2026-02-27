-- CreateTable
CREATE TABLE "StoreCounter" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreCounter_storeId_key" ON "StoreCounter"("storeId");

-- AddForeignKey
ALTER TABLE "StoreCounter" ADD CONSTRAINT "StoreCounter_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
