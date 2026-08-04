-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "region" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN "salespersonId" TEXT;
