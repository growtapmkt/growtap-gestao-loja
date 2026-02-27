-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'PRO_PLUS');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';
