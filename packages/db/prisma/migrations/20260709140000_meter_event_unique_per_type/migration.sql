-- MeterEvent previously allowed only one event per order (unique on orderId).
-- But an order legitimately accrues two meter events over its lifetime: a
-- PACKAGE_ALLOWANCE at delivery (scanner router) and an OVERDUE_PACKAGE_HOLDING
-- at late pickup (orders router). The second insert collided on the unique
-- orderId, throwing "Unique constraint failed on the fields: (orderId)" and
-- breaking pickup of any overdue package.
--
-- Replace the single-column unique with a composite (orderId, eventType) unique
-- so each order can hold one event of each type, while still preventing a
-- duplicate same-type charge (e.g. a retry double-metering the same order).
--
-- No existing rows can violate the new constraint: orderId was globally unique
-- before, so there was at most one MeterEvent per order. NULL orderIds remain
-- distinct under a Postgres unique index, so Stripe-only events are unaffected.
DROP INDEX "MeterEvent_orderId_key";

CREATE UNIQUE INDEX "MeterEvent_orderId_eventType_key" ON "MeterEvent"("orderId", "eventType");
