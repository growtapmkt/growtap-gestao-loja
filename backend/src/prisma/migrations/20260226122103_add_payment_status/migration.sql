-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "conditionalId" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PAID';

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_conditionalId_fkey" FOREIGN KEY ("conditionalId") REFERENCES "Conditional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
