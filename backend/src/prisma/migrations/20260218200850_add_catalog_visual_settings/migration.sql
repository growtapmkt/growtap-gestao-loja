/*
  Warnings:

  - You are about to drop the column `catalogAllowDirectOrder` on the `StoreSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoreSettings" DROP COLUMN "catalogAllowDirectOrder",
ADD COLUMN     "catalogBackgroundColor" TEXT NOT NULL DEFAULT '#f8fafc',
ADD COLUMN     "catalogBannerHeight" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "catalogBannerImage" TEXT,
ADD COLUMN     "catalogBannerOverlay" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "catalogButtonFormat" TEXT NOT NULL DEFAULT 'rounded',
ADD COLUMN     "catalogButtonText" TEXT NOT NULL DEFAULT 'Ver Detalhes',
ADD COLUMN     "catalogCardColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "catalogCardRadius" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "catalogCardShadow" TEXT NOT NULL DEFAULT 'md',
ADD COLUMN     "catalogColumns" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "catalogLayout" TEXT NOT NULL DEFAULT 'grid',
ADD COLUMN     "catalogPriceColor" TEXT NOT NULL DEFAULT '#0158ad',
ADD COLUMN     "catalogPrimaryColor" TEXT NOT NULL DEFAULT '#0158ad',
ADD COLUMN     "catalogSecondaryColor" TEXT NOT NULL DEFAULT '#1e293b',
ADD COLUMN     "catalogShowBannerTitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "catalogShowButtonIcon" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "catalogTextColor" TEXT NOT NULL DEFAULT '#1e293b';
