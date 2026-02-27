/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CharacteristicStatus" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('ROUPA', 'ACESSORIO', 'CALCADO');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "CategoryPublic" AS ENUM ('FEMININO', 'MASCULINO', 'INFANTIL', 'UNISSEX');

-- CreateEnum
CREATE TYPE "CategorySeasonality" AS ENUM ('VERAO', 'INVERNO', 'MEIA_ESTACAO', 'ATEMPORAL');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN     "lastEntryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSaleDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contactPerson" TEXT,
    "cep" TEXT,
    "address" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Characteristic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "options" TEXT,
    "status" "CharacteristicStatus" NOT NULL DEFAULT 'ATIVA',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCharacteristic" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "characteristicId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductCharacteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CategoryType" NOT NULL DEFAULT 'ROUPA',
    "status" "CategoryStatus" NOT NULL DEFAULT 'ATIVA',
    "order" INTEGER NOT NULL DEFAULT 0,
    "public" "CategoryPublic" NOT NULL DEFAULT 'UNISSEX',
    "seasonality" "CategorySeasonality" NOT NULL DEFAULT 'ATEMPORAL',
    "expectedMargin" DOUBLE PRECISION,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_cnpj_key" ON "Brand"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Characteristic_name_key" ON "Characteristic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCharacteristic" ADD CONSTRAINT "ProductCharacteristic_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCharacteristic" ADD CONSTRAINT "ProductCharacteristic_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "Characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
