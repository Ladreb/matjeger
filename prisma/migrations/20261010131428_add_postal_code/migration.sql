/*
  Warnings:

  - Added the required column `postalCode` to the `PriceReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PriceReport_productId_store_reportedAt_idx";

-- AlterTable
ALTER TABLE "PriceReport" ADD COLUMN     "postalCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "postalCode" TEXT;

-- CreateIndex
CREATE INDEX "PriceReport_productId_store_postalCode_reportedAt_idx" ON "PriceReport"("productId", "store", "postalCode", "reportedAt");
