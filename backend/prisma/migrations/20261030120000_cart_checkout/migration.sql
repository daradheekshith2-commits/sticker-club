-- Cart and checkout persistence additions.
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddress" JSONB;
UPDATE "Order" SET "shippingAddress" = '{}'::jsonb WHERE "shippingAddress" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingAddress" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_productId_key" ON "CartItem"("cartId","productId");
CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId");
