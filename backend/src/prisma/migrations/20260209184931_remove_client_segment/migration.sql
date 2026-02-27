-- CreateEnum
CREATE TYPE "ConditionalStatus" AS ENUM ('PENDING', 'FINISHED', 'RETURNED', 'PARTIAL_RETURNED', 'OVERDUE');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "bottomSize" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "favoriteColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "personalNotes" TEXT,
ADD COLUMN     "shoesSize" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "topSize" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryMethod" TEXT NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountType" TEXT NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "observation" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Conditional" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ConditionalStatus" NOT NULL DEFAULT 'PENDING',
    "returnDate" TIMESTAMP(3) NOT NULL,
    "observation" TEXT,
    "orderNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conditional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionalItem" (
    "id" TEXT NOT NULL,
    "conditionalId" TEXT NOT NULL,
    "variationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ConditionalItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Conditional" ADD CONSTRAINT "Conditional_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conditional" ADD CONSTRAINT "Conditional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalItem" ADD CONSTRAINT "ConditionalItem_conditionalId_fkey" FOREIGN KEY ("conditionalId") REFERENCES "Conditional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalItem" ADD CONSTRAINT "ConditionalItem_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "ProductVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
