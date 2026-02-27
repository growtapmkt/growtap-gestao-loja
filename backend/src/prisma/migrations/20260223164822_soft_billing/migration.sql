/*
  Warnings:

  - You are about to drop the column `price` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "price",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "limits" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "priceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "priceYearly" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "stripePriceIdMonthly" TEXT,
ADD COLUMN     "stripePriceIdYearly" TEXT,
ALTER COLUMN "features" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "StoreSubscription" ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "externalSubscriptionId" TEXT,
ADD COLUMN     "paymentProvider" TEXT;

-- CreateTable
CREATE TABLE "FeatureUsage" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureUsage_storeId_idx" ON "FeatureUsage"("storeId");

-- CreateIndex
CREATE INDEX "FeatureUsage_storeId_featureKey_idx" ON "FeatureUsage"("storeId", "featureKey");

-- AddForeignKey
ALTER TABLE "FeatureUsage" ADD CONSTRAINT "FeatureUsage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
