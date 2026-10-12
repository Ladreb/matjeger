-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favouriteStores" "Store"[] DEFAULT ARRAY[]::"Store"[];
