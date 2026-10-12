-- CreateTable
CREATE TABLE "UnknownBarcodeScan" (
    "barcode" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "UnknownBarcodeScan_pkey" PRIMARY KEY ("barcode")
);

-- CreateTable
CREATE TABLE "UnknownBarcodeScanner" (
    "barcode" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "scannerHash" TEXT NOT NULL,

    CONSTRAINT "UnknownBarcodeScanner_pkey" PRIMARY KEY ("barcode","day","scannerHash")
);

-- CreateIndex
CREATE INDEX "UnknownBarcodeScanner_day_idx" ON "UnknownBarcodeScanner"("day");
