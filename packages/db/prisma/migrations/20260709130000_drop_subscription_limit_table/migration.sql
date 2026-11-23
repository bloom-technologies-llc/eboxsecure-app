-- The SubscriptionLimit table is no longer used. Per-tier subscription limits
-- are now hardcoded in packages/stripe/src/index.ts (SUBSCRIPTION_LIMITS).
--
-- The table held reference data that was never seeded, so the only reader
-- (markOrderAsPickedUp in admin-api) threw findUniqueOrThrow at runtime.
-- Dropping it removes that dependency on unseeded data. No rows are lost
-- (the table was empty) and no foreign keys reference it. The SubscriptionType
-- enum is retained — it is still used by CustomerAccount.subscription.
DROP TABLE "SubscriptionLimit";
