/*
  Warnings:

  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pluCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PRODUCT_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('PER_UNIT', 'PER_KG');

-- AlterTable
ALTER TABLE "PriceReport" ADD COLUMN     "priceUnit" "PriceUnit" NOT NULL DEFAULT 'PER_UNIT';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "unit",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "pluCode" TEXT,
ADD COLUMN     "volumeMl" INTEGER,
ADD COLUMN     "weightG" INTEGER,
ALTER COLUMN "barcode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Product_pluCode_key" ON "Product"("pluCode");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
