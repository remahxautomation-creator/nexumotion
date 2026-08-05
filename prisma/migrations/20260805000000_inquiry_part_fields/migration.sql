-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "partNumber" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "sku" TEXT;

-- CreateIndex
CREATE INDEX "Inquiry_kind_idx" ON "Inquiry"("kind");

