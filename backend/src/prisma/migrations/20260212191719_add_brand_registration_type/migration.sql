-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "registrationType" TEXT NOT NULL DEFAULT 'COMPLETE',
ADD COLUMN     "whatsapp" TEXT;
