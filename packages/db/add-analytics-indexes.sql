-- Essential Database Indexes for Analytics Dashboard
-- Run this after seeding data to optimize analytics query performance

-- Core indexes for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_location_delivered_date
ON "Order" (shipped_location_id, delivered_date)
WHERE delivered_date IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_location_pickup_date
ON "Order" (shipped_location_id, picked_up_at)
WHERE picked_up_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_customer_location_date
ON "Order" (customer_id, shipped_location_id, delivered_date)
WHERE delivered_date IS NOT NULL;

-- Composite index for current utilization queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_current_packages
ON "Order" (shipped_location_id, delivered_date, picked_up_at)
WHERE delivered_date IS NOT NULL;

-- Index for revenue analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_revenue_analytics
ON "Order" (shipped_location_id, delivered_date, total)
WHERE delivered_date IS NOT NULL;

-- Partial index for processing time analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_processing_times
ON "Order" (shipped_location_id, delivered_date, processed_at)
WHERE delivered_date IS NOT NULL AND processed_at IS NOT NULL;

-- Index for pickup time analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_pickup_analysis
ON "Order" (shipped_location_id, delivered_date, picked_up_at)
WHERE delivered_date IS NOT NULL AND picked_up_at IS NOT NULL;

-- Index for time-based queries (date range filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_delivered_date
ON "Order" (delivered_date)
WHERE delivered_date IS NOT NULL;

-- Index for customer analysis across locations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_customer_analytics
ON "Order" (customer_id, delivered_date)
WHERE delivered_date IS NOT NULL; 