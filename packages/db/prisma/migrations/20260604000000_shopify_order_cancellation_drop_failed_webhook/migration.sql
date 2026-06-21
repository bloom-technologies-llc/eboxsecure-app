-- Add Shopify cancellation tracking to Order (issue #58)
ALTER TABLE "Order" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelReason" TEXT;

-- Drop the dead-letter table; failed webhooks now self-heal via Shopify retries (issue #53)
DROP TABLE "failed_webhook_forward";
