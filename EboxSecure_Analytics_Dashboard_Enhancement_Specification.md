# EboxSecure Admin Portal Analytics Dashboard Enhancement Specification

## Executive Summary

This document outlines the comprehensive enhancement of the EboxSecure admin portal's analytics dashboard. The enhanced dashboard will provide detailed insights into location utilization, customer behavior, operational efficiency, and performance metrics across all warehouse locations. The dashboard will support both aggregate-level analytics and location-specific drill-down capabilities with multi-location comparison features.

## Current State Analysis

### Existing Features

- Basic metric cards (Total Parcels, Average Utilization, Efficiency Score, Active Locations)
- Parcel distribution pie chart
- Revenue overview bar chart
- Location performance pie chart
- Recent activity feed
- Single location selector dropdown
- Basic date picker (single date selection)

### Limitations

- Limited utilization rate definition and tracking
- No pickup rate analytics
- No customer usage analytics per location
- No multi-location comparison capabilities
- Limited time-based analysis options
- No data export functionality
- Static mock data without real-time updates

## Enhanced Dashboard Requirements

### 1. Core Metrics Enhancement

#### 1.1 Utilization Rate Metrics

**Definition**: Two complementary utilization metrics will be implemented:

1. **Current Utilization Rate**: `(Current packages stored / Total storage capacity) × 100`

   - Real-time snapshot of location capacity usage
   - Critical for immediate operational decisions

2. **Average Daily Utilization Rate**: `(Average daily packages / Total storage capacity) × 100`
   - Historical trend analysis over selected time period
   - Better for long-term planning and capacity management

**Implementation Details**:

- Storage capacity will be added to the Location model as `storageCapacity: Int`
- Mock data will include varied capacities (200-800 packages per location)
- Both metrics displayed in separate cards with clear labeling
- Color-coded indicators: Green (<70%), Yellow (70-85%), Red (>85%)

#### 1.2 Pickup Rate Analytics

**Primary Metric**: Average time from delivery to pickup (in hours/days)

**Additional Analytics**:

- **Pickup Time Distribution**: Histogram showing percentage of packages picked up within:
  - Same day (0-24 hours)
  - 1-2 days
  - 3-5 days
  - 6+ days
- **Day of Week Analysis**: Bar chart showing pickup volume by day
- **Time of Day Analysis**: Heatmap showing pickup patterns by hour (business hours focus)

#### 1.3 Customer Usage Analytics

**Primary Metric**: Number of unique customers with packages delivered to location within selected timeframe

**Implementation**:

- Count distinct `customerId` from `Order` table filtered by `shippedLocationId` and date range
- Display as metric card with trend indicator
- Breakdown by new vs. returning customers (first-time vs. repeat location usage)

### 2. Time Period Framework

**Selected Time Periods** (based on business relevance):

- **Real-time**: Today's data
- **Short-term**: Last 7 days, Last 30 days
- **Medium-term**: Last 90 days, Current quarter
- **Long-term**: Last 12 months, Year-to-date

**Rationale**: These periods align with operational (daily/weekly), tactical (monthly/quarterly), and strategic (annual) decision-making cycles.

### 3. Multi-Location Comparison Feature

**Decision**: Implement multi-location comparison with dedicated comparison view

**Justification**:

- Essential for identifying best practices and performance gaps
- Enables data-driven resource allocation decisions
- Supports competitive analysis between locations

**UX Design**:

- **Primary Dashboard**: Maintains current single location + "All Locations" selector
- **New "Compare Locations" Button**: Opens dedicated comparison modal/page
- **Comparison Interface**:
  - Multi-select dropdown for choosing 2-4 locations
  - Side-by-side metric cards for key KPIs
  - Comparative charts (bar charts work best for comparison)
  - Percentage difference indicators between locations

### 4. Additional Operational Metrics

#### 4.1 Package Processing Time

- **Definition**: Time from package delivery to "ready for pickup" status
- **Target**: Average processing time under 2 hours
- **Display**: Metric card with trend and distribution chart

#### 4.2 Peak Capacity Periods

- **Analysis**: Identify highest utilization periods by:
  - Time of day
  - Day of week
  - Month of year
- **Display**: Heatmap visualization with capacity percentage color coding

#### 4.3 Revenue Per Location

- **Calculation**: Total revenue generated per location over selected period
- **Display**: Bar chart with revenue amounts and per-package revenue metrics

### 5. Enhanced Dashboard Layout

#### 5.1 Top Section (Controls)

- Enhanced date range picker supporting predefined periods and custom ranges
- Location selector with "All Locations" and individual location options
- "Compare Locations" button
- Export buttons (CSV/PDF)

#### 5.2 Key Metrics Row (6 cards)

1. Total Packages
2. Current Utilization Rate
3. Average Daily Utilization Rate
4. Average Pickup Time
5. Unique Customers
6. Package Processing Time

#### 5.3 Primary Analytics Section (2x2 grid)

1. **Utilization Trends**: Line chart showing both utilization metrics over time
2. **Pickup Rate Analysis**: Combined chart with average pickup time and distribution
3. **Customer Usage Patterns**: Bar chart showing customer counts and trends
4. **Revenue Performance**: Bar chart with revenue per location and trends

#### 5.4 Operational Insights Section (2x1 grid)

1. **Peak Capacity Analysis**: Heatmap showing utilization patterns
2. **Processing Efficiency**: Chart showing processing times and bottlenecks

#### 5.5 Bottom Section

- Enhanced Recent Activity feed
- Location Performance summary table

### 6. Data Export Functionality

#### 6.1 CSV Export

- **Scope**: All visible metrics and underlying data for selected time period and locations
- **Format**: Structured CSV with separate sheets for different metric categories
- **Filename**: `eboxsecure-analytics-{location}-{daterange}-{timestamp}.csv`

#### 6.2 PDF Export

- **Scope**: Executive summary report with key visualizations
- **Format**: Professional PDF report with EboxSecure branding
- **Content**:
  - Executive summary with key metrics
  - Visual charts (exported as images)
  - Trend analysis and insights
  - Location comparison tables (if applicable)

### 7. Access Control Implementation

#### 7.1 Corporate Account Access

- Full dashboard access with all features
- All analytics and export capabilities
- Multi-location comparison features

#### 7.2 Employee Account Restrictions

- **Placeholder Page**: Professional message explaining access limitations
- **Content**: "Analytics Dashboard access is restricted to corporate accounts. Please contact your administrator for access."
- **Design**: Consistent with admin portal styling, includes navigation but replaces dashboard content

### 8. Technical Implementation Requirements

#### 8.1 Database Schema Enhancements

```sql
-- Update existing Location model
ALTER TABLE Location ADD COLUMN storageCapacity INTEGER NOT NULL DEFAULT 500;

-- Update existing Order model
ALTER TABLE Order ADD COLUMN pickedUpAt TIMESTAMP;
ALTER TABLE Order ADD COLUMN processedAt TIMESTAMP; -- When package is ready for pickup
```

#### 8.2 New Data Models

```typescript
interface UtilizationMetrics {
  locationId: number;
  currentUtilization: number;
  averageDailyUtilization: number;
  storageCapacity: number;
  currentPackageCount: number;
}

interface PickupAnalytics {
  locationId: number;
  averagePickupTime: number; // in hours
  pickupDistribution: {
    sameDay: number;
    oneTwoDay: number;
    threeFiveDay: number;
    sixPlusDay: number;
  };
  dayOfWeekPattern: Record<string, number>;
  hourlyPattern: Record<number, number>;
}

interface CustomerUsageMetrics {
  locationId: number;
  uniqueCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averagePackagesPerCustomer: number;
}
```

#### 8.3 API Endpoints

- `GET /api/analytics/utilization` - Utilization metrics
- `GET /api/analytics/pickup-rates` - Pickup analytics
- `GET /api/analytics/customer-usage` - Customer metrics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/export/csv` - CSV export
- `GET /api/analytics/export/pdf` - PDF export

#### 8.4 Component Architecture

```
/dashboard
  ├── enhanced-metrics-cards.tsx
  ├── utilization-trends-chart.tsx
  ├── pickup-analysis-chart.tsx
  ├── customer-usage-chart.tsx
  ├── revenue-performance-chart.tsx
  ├── peak-capacity-heatmap.tsx
  ├── processing-efficiency-chart.tsx
  ├── location-comparison-modal.tsx
  ├── enhanced-date-range-picker.tsx
  └── export-controls.tsx
```

### 9. Backend Integration Requirements

#### 9.1 Current State Assessment

The existing dashboard is currently implemented with 100% mock/fake data and has no backend integration. All metrics, charts, and data displayed are static or randomly generated values. To implement the enhanced analytics dashboard, comprehensive backend integration work is required.

#### 9.2 Data Layer Implementation

##### 9.2.1 Database Schema Updates

See 8.1

##### 9.2.2 tRPC Router Implementation

```typescript
// New analytics router needed
export const analyticsRouter = createTRPCRouter({
  getUtilizationMetrics: protectedCorporateProcedure
    .input(
      z.object({
        locationId: z.number().optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation for utilization calculations
    }),

  getPickupAnalytics: protectedCorporateProcedure
    .input(
      z.object({
        locationId: z.number().optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation for pickup rate calculations
    }),

  getCustomerUsageMetrics: protectedCorporateProcedure
    .input(
      z.object({
        locationId: z.number().optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation for customer analytics
    }),

  getRevenueAnalytics: protectedCorporateProcedure
    .input(
      z.object({
        locationId: z.number().optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation for revenue calculations
    }),

  exportAnalyticsData: protectedCorporateProcedure
    .input(
      z.object({
        format: z.enum(["csv", "pdf"]),
        locationId: z.number().optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Implementation for data export
    }),
});
```

#### 9.3 Authentication & Authorization Updates

##### 9.3.1 Corporate Account Procedure

```typescript
// New procedure needed for corporate-only access
export const protectedCorporateProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const userId = ctx.session.userId;
    const userType = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    });

    if (!userType || userType.userType !== "CORPORATE") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: { ...ctx.session },
      },
    });
  },
);
```

##### 9.3.2 Dashboard Access Control

```typescript
// Component-level access control
const DashboardPage = () => {
  const { data: userType } = api.user.getUserType.useQuery();

  if (userType?.userType !== "CORPORATE") {
    return <UnauthorizedDashboardPlaceholder />;
  }

  return <EnhancedAnalyticsDashboard />;
};
```

#### 9.4 Data Processing & Aggregation Services

##### 9.4.1 Real-time Metrics Calculation

```typescript
// Service for calculating current utilization
export class UtilizationService {
  static async getCurrentUtilization(locationId: number): Promise<number> {
    const location = await db.location.findUnique({
      where: { id: locationId },
      select: { storageCapacity: true },
    });

    const currentPackages = await db.order.count({
      where: {
        shippedLocationId: locationId,
        deliveredDate: { not: null },
        pickedUpAt: null,
      },
    });

    return (currentPackages / location.storageCapacity) * 100;
  }

  static async getAverageDailyUtilization(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<number> {
    const location = await db.location.findUnique({
      where: { id: locationId },
      select: { storageCapacity: true },
    });

    // Calculate daily package counts for the date range
    const dailyUtilization = await db.$queryRaw<
      Array<{ date: string; package_count: number }>
    >`
      SELECT 
        DATE(delivered_date) as date,
        COUNT(*) as package_count
      FROM "Order" 
      WHERE shipped_location_id = ${locationId}
        AND delivered_date >= ${dateRange.from}
        AND delivered_date <= ${dateRange.to}
        AND delivered_date IS NOT NULL
      GROUP BY DATE(delivered_date)
      ORDER BY date
    `;

    if (dailyUtilization.length === 0) return 0;

    const averagePackagesPerDay =
      dailyUtilization.reduce(
        (sum, day) => sum + Number(day.package_count),
        0,
      ) / dailyUtilization.length;

    return (averagePackagesPerDay / location.storageCapacity) * 100;
  }

  static async getAllLocationsUtilization(dateRange: { from: Date; to: Date }) {
    return await db.$queryRaw<
      Array<{
        location_id: number;
        location_name: string;
        current_packages: number;
        storage_capacity: number;
        current_utilization: number;
        avg_daily_utilization: number;
      }>
    >`
      WITH daily_counts AS (
        SELECT 
          l.id as location_id,
          l.name as location_name,
          l.storage_capacity,
          DATE(o.delivered_date) as date,
          COUNT(o.id) as daily_packages
        FROM "Location" l
        LEFT JOIN "Order" o ON l.id = o.shipped_location_id 
          AND o.delivered_date >= ${dateRange.from}
          AND o.delivered_date <= ${dateRange.to}
          AND o.delivered_date IS NOT NULL
        GROUP BY l.id, l.name, l.storage_capacity, DATE(o.delivered_date)
      ),
      current_packages AS (
        SELECT 
          l.id as location_id,
          COUNT(o.id) as current_count
        FROM "Location" l
        LEFT JOIN "Order" o ON l.id = o.shipped_location_id 
          AND o.delivered_date IS NOT NULL 
          AND o.picked_up_at IS NULL
        GROUP BY l.id
      )
      SELECT 
        dc.location_id,
        dc.location_name,
        COALESCE(cp.current_count, 0) as current_packages,
        dc.storage_capacity,
        ROUND((COALESCE(cp.current_count, 0) * 100.0 / dc.storage_capacity), 2) as current_utilization,
        ROUND((AVG(dc.daily_packages) * 100.0 / dc.storage_capacity), 2) as avg_daily_utilization
      FROM daily_counts dc
      LEFT JOIN current_packages cp ON dc.location_id = cp.location_id
      GROUP BY dc.location_id, dc.location_name, dc.storage_capacity, cp.current_count
      ORDER BY dc.location_name
    `;
  }
}
```

##### 9.4.2 Pickup Analytics Service

```typescript
export class PickupAnalyticsService {
  static async getAveragePickupTime(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<number> {
    const result = await db.$queryRaw<Array<{ avg_pickup_hours: number }>>`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (picked_up_at - delivered_date)) / 3600) as avg_pickup_hours
      FROM "Order"
      WHERE shipped_location_id = ${locationId}
        AND delivered_date >= ${dateRange.from}
        AND delivered_date <= ${dateRange.to}
        AND picked_up_at IS NOT NULL
        AND delivered_date IS NOT NULL
    `;

    return result[0]?.avg_pickup_hours || 0;
  }

  static async getPickupDistribution(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<{
    sameDay: number;
    oneTwoDay: number;
    threeFiveDay: number;
    sixPlusDay: number;
  }> {
    const result = await db.$queryRaw<
      Array<{
        same_day: number;
        one_two_day: number;
        three_five_day: number;
        six_plus_day: number;
      }>
    >`
      SELECT 
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (picked_up_at - delivered_date)) / 86400 < 1 THEN 1 END) as same_day,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (picked_up_at - delivered_date)) / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (picked_up_at - delivered_date)) / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (picked_up_at - delivered_date)) / 86400 > 5 THEN 1 END) as six_plus_day
      FROM "Order"
      WHERE shipped_location_id = ${locationId}
        AND delivered_date >= ${dateRange.from}
        AND delivered_date <= ${dateRange.to}
        AND picked_up_at IS NOT NULL
        AND delivered_date IS NOT NULL
    `;

    const data = result[0];
    return {
      sameDay: Number(data?.same_day || 0),
      oneTwoDay: Number(data?.one_two_day || 0),
      threeFiveDay: Number(data?.three_five_day || 0),
      sixPlusDay: Number(data?.six_plus_day || 0),
    };
  }

  static async getPickupPatterns(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<{
    dayOfWeekPattern: Record<string, number>;
    hourlyPattern: Record<number, number>;
  }> {
    // Day of week pattern
    const dayOfWeekData = await db.$queryRaw<
      Array<{ day_name: string; pickup_count: number }>
    >`
      SELECT 
        TO_CHAR(picked_up_at, 'Day') as day_name,
        COUNT(*) as pickup_count
      FROM "Order"
      WHERE shipped_location_id = ${locationId}
        AND picked_up_at >= ${dateRange.from}
        AND picked_up_at <= ${dateRange.to}
        AND picked_up_at IS NOT NULL
      GROUP BY TO_CHAR(picked_up_at, 'Day'), EXTRACT(DOW FROM picked_up_at)
      ORDER BY EXTRACT(DOW FROM picked_up_at)
    `;

    // Hourly pattern
    const hourlyData = await db.$queryRaw<
      Array<{ hour: number; pickup_count: number }>
    >`
      SELECT 
        EXTRACT(HOUR FROM picked_up_at) as hour,
        COUNT(*) as pickup_count
      FROM "Order"
      WHERE shipped_location_id = ${locationId}
        AND picked_up_at >= ${dateRange.from}
        AND picked_up_at <= ${dateRange.to}
        AND picked_up_at IS NOT NULL
      GROUP BY EXTRACT(HOUR FROM picked_up_at)
      ORDER BY hour
    `;

    const dayOfWeekPattern: Record<string, number> = {};
    dayOfWeekData.forEach((row) => {
      dayOfWeekPattern[row.day_name.trim()] = Number(row.pickup_count);
    });

    const hourlyPattern: Record<number, number> = {};
    hourlyData.forEach((row) => {
      hourlyPattern[Number(row.hour)] = Number(row.pickup_count);
    });

    return { dayOfWeekPattern, hourlyPattern };
  }
}
```

##### 9.4.3 Customer Usage Analytics Service

```typescript
export class CustomerUsageService {
  static async getCustomerMetrics(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<{
    uniqueCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averagePackagesPerCustomer: number;
  }> {
    const result = await db.$queryRaw<
      Array<{
        unique_customers: number;
        new_customers: number;
        returning_customers: number;
        total_packages: number;
      }>
    >`
      WITH customer_stats AS (
        SELECT 
          o.customer_id,
          COUNT(*) as package_count,
          MIN(o.delivered_date) as first_delivery_at_location,
          (
            SELECT MIN(delivered_date) 
            FROM "Order" o2 
            WHERE o2.customer_id = o.customer_id 
              AND o2.shipped_location_id = ${locationId}
              AND o2.delivered_date IS NOT NULL
          ) as first_ever_delivery_at_location
        FROM "Order" o
        WHERE o.shipped_location_id = ${locationId}
          AND o.delivered_date >= ${dateRange.from}
          AND o.delivered_date <= ${dateRange.to}
          AND o.delivered_date IS NOT NULL
        GROUP BY o.customer_id
      )
      SELECT 
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(CASE WHEN first_ever_delivery_at_location >= ${dateRange.from} THEN 1 END) as new_customers,
        COUNT(CASE WHEN first_ever_delivery_at_location < ${dateRange.from} THEN 1 END) as returning_customers,
        SUM(package_count) as total_packages
      FROM customer_stats
    `;

    const data = result[0];
    const uniqueCustomers = Number(data?.unique_customers || 0);
    const totalPackages = Number(data?.total_packages || 0);

    return {
      uniqueCustomers,
      newCustomers: Number(data?.new_customers || 0),
      returningCustomers: Number(data?.returning_customers || 0),
      averagePackagesPerCustomer:
        uniqueCustomers > 0 ? totalPackages / uniqueCustomers : 0,
    };
  }
}
```

##### 9.4.4 Revenue Analytics Service

```typescript
export class RevenueAnalyticsService {
  static async getRevenueMetrics(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<{
    totalRevenue: number;
    averageRevenuePerPackage: number;
    monthlyRevenueTrend: Array<{ month: string; revenue: number }>;
  }> {
    const result = await db.$queryRaw<
      Array<{
        total_revenue: number;
        package_count: number;
      }>
    >`
      SELECT 
        SUM(total) as total_revenue,
        COUNT(*) as package_count
      FROM "Order"
      WHERE shipped_location_id = ${locationId}
        AND delivered_date >= ${dateRange.from}
        AND delivered_date <= ${dateRange.to}
        AND delivered_date IS NOT NULL
    `;

    const monthlyTrend = await db.$queryRaw<
      Array<{
        month: string;
        revenue: number;
      }>
    >`
      SELECT 
        TO_CHAR(delivered_date, 'YYYY-MM') as month,
        SUM(total) as revenue
      FROM "Order"
      WHERE shipped_location_id = ${locationId}
        AND delivered_date >= ${dateRange.from}
        AND delivered_date <= ${dateRange.to}
        AND delivered_date IS NOT NULL
      GROUP BY TO_CHAR(delivered_date, 'YYYY-MM')
      ORDER BY month
    `;

    const data = result[0];
    const totalRevenue = Number(data?.total_revenue || 0);
    const packageCount = Number(data?.package_count || 0);

    return {
      totalRevenue,
      averageRevenuePerPackage:
        packageCount > 0 ? totalRevenue / packageCount : 0,
      monthlyRevenueTrend: monthlyTrend.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue),
      })),
    };
  }
}
```

#### 9.5 Frontend Integration Updates

##### 9.5.1 Replace Mock Data with tRPC Calls

```typescript
// Current: Static mock data
const data = [
  { name: "Location A", parcels: 400, utilization: 80 },
  // ...
];

// New: Real data from backend
const { data: utilizationData, isLoading } =
  api.analytics.getUtilizationMetrics.useQuery({
    locationId:
      selectedLocation === "all" ? undefined : parseInt(selectedLocation),
    dateRange: { from: dateRange.from, to: dateRange.to },
  });
```

##### 9.5.2 Error Handling & Loading States

```typescript
// Add proper loading and error states for all data fetching
const MetricsCard = ({ locationId, dateRange }) => {
  const { data, isLoading, error } = api.analytics.getUtilizationMetrics.useQuery({
    locationId,
    dateRange
  });

  if (isLoading) return <MetricsCardSkeleton />;
  if (error) return <MetricsCardError error={error} />;

  return <MetricsCardContent data={data} />;
};
```

#### 9.6 Data Migration & Seeding

##### 9.6.1 Historical Data Backfill

```typescript
// Script to populate historical analytics data
export async function backfillAnalyticsData() {
  // Generate realistic historical data for existing orders
  // Populate LocationUtilizationDaily table
  // Calculate and store historical pickup times
  // Ensure data consistency across all locations
}
```

##### 9.6.2 Location Capacity Configuration

```typescript
// Script to set realistic storage capacities for existing locations
const locationCapacities = {
  1: 500, // Location A
  2: 350, // Location B
  3: 750, // Location C
  4: 400, // Location D
  5: 600, // Location E
};

export async function updateLocationCapacities() {
  for (const [locationId, capacity] of Object.entries(locationCapacities)) {
    await db.location.update({
      where: { id: parseInt(locationId) },
      data: { storageCapacity: capacity },
    });
  }
}
```

#### 9.7 Performance Optimization

##### 9.7.1 Database Query Optimization

##### 9.7.1.1 Essential Database Indexes

```sql
-- Core indexes for analytics queries
CREATE INDEX CONCURRENTLY idx_order_location_delivered_date
ON "Order" (shipped_location_id, delivered_date)
WHERE delivered_date IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_order_location_pickup_date
ON "Order" (shipped_location_id, picked_up_at)
WHERE picked_up_at IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_order_customer_location_date
ON "Order" (customer_id, shipped_location_id, delivered_date)
WHERE delivered_date IS NOT NULL;

-- Composite index for current utilization queries
CREATE INDEX CONCURRENTLY idx_order_current_packages
ON "Order" (shipped_location_id, delivered_date, picked_up_at)
WHERE delivered_date IS NOT NULL;

-- Index for revenue analytics
CREATE INDEX CONCURRENTLY idx_order_revenue_analytics
ON "Order" (shipped_location_id, delivered_date, total)
WHERE delivered_date IS NOT NULL;

-- Partial index for processing time analytics
CREATE INDEX CONCURRENTLY idx_order_processing_times
ON "Order" (shipped_location_id, delivered_date, ready_for_pickup_at, processed_at)
WHERE delivered_date IS NOT NULL AND ready_for_pickup_at IS NOT NULL;
```

##### 9.7.1.2 Query Optimization Strategies

**Connection Pooling Configuration:**

```typescript
// Database connection optimization
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "info", "warn", "error"],
});

// Connection pool settings for analytics workload
const poolConfig = {
  max: 20, // Maximum number of connections
  min: 5, // Minimum number of connections
  acquire: 30000, // Maximum time to acquire connection
  idle: 10000, // Maximum time connection can be idle
};
```

**Query Result Caching:**

```typescript
import { Redis } from "ioredis";

export class AnalyticsCacheService {
  private redis: Redis;
  private defaultTTL = 300; // 5 minutes

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async getCachedResult<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await queryFn();
    await this.redis.setex(key, ttl, JSON.stringify(result));

    return result;
  }

  generateCacheKey(
    service: string,
    method: string,
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): string {
    const fromStr = dateRange.from.toISOString().split("T")[0];
    const toStr = dateRange.to.toISOString().split("T")[0];
    return `analytics:${service}:${method}:${locationId}:${fromStr}:${toStr}`;
  }

  async invalidateLocationCache(locationId: number): Promise<void> {
    const pattern = `analytics:*:*:${locationId}:*`;
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

**Optimized Service Implementation with Caching:**

```typescript
export class OptimizedUtilizationService extends UtilizationService {
  private cache = new AnalyticsCacheService();

  static async getCurrentUtilization(locationId: number): Promise<number> {
    const cacheKey = `current_utilization:${locationId}`;

    return await this.cache.getCachedResult(
      cacheKey,
      () => super.getCurrentUtilization(locationId),
      60, // 1 minute cache for current data
    );
  }

  static async getAverageDailyUtilization(
    locationId: number,
    dateRange: { from: Date; to: Date },
  ): Promise<number> {
    const cacheKey = this.cache.generateCacheKey(
      "utilization",
      "averageDaily",
      locationId,
      dateRange,
    );

    return await this.cache.getCachedResult(
      cacheKey,
      () => super.getAverageDailyUtilization(locationId, dateRange),
      1800, // 30 minutes cache for historical data
    );
  }
}
```

#### 9.7.2 Frontend Performance Optimization

##### 9.7.2.1 Data Loading Strategies

```typescript
// Implement progressive data loading
export const useAnalyticsData = (locationId: number, dateRange: DateRange) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load critical metrics first
        const criticalMetrics = await Promise.all([
          api.getCurrentUtilization(locationId),
          api.getCurrentPackageCount(locationId),
        ]);

        setData((prev) => ({
          ...prev,
          currentUtilization: criticalMetrics[0],
          currentPackages: criticalMetrics[1],
        }));

        // Load secondary metrics
        const secondaryMetrics = await Promise.all([
          api.getAveragePickupTime(locationId, dateRange),
          api.getCustomerMetrics(locationId, dateRange),
          api.getRevenueMetrics(locationId, dateRange),
        ]);

        setData((prev) => ({
          ...prev,
          averagePickupTime: secondaryMetrics[0],
          customerMetrics: secondaryMetrics[1],
          revenueMetrics: secondaryMetrics[2],
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [locationId, dateRange]);

  return { data, loading, error };
};
```

##### 9.7.2.2 Chart Optimization

```typescript
// Implement data sampling for large datasets
export const optimizeChartData = (
  data: Array<{ date: string; value: number }>,
  maxPoints: number = 100
): Array<{ date: string; value: number }> => {
  if (data.length <= maxPoints) {
    return data;
  }

  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

// Lazy load chart components
const LazyLineChart = lazy(() => import('./charts/LineChart'));
const LazyBarChart = lazy(() => import('./charts/BarChart'));

export const AnalyticsChart: React.FC<ChartProps> = ({ type, data }) => {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      {type === 'line' && <LazyLineChart data={data} />}
      {type === 'bar' && <LazyBarChart data={data} />}
    </Suspense>
  );
};
```

#### 9.7.3 API Response Optimization

##### 9.7.3.1 Response Compression and Pagination

```typescript
// API route with compression and pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = parseInt(searchParams.get("locationId") || "0");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const dateRange = {
    from: new Date(searchParams.get("from") || ""),
    to: new Date(searchParams.get("to") || ""),
  };

  try {
    const offset = (page - 1) * limit;

    // Use database-level pagination
    const [data, totalCount] = await Promise.all([
      db.order.findMany({
        where: {
          shippedLocationId: locationId,
          deliveredDate: { gte: dateRange.from, lte: dateRange.to },
        },
        select: {
          id: true,
          deliveredDate: true,
          pickedUpAt: true,
          total: true,
        },
        skip: offset,
        take: limit,
        orderBy: { deliveredDate: "desc" },
      }),
      db.order.count({
        where: {
          shippedLocationId: locationId,
          deliveredDate: { gte: dateRange.from, lte: dateRange.to },
        },
      }),
    ]);

    const response = {
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Content-Encoding": "gzip",
        "Cache-Control": "public, max-age=300", // 5 minutes
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
```

##### 9.7.3.2 Query Performance Monitoring

```typescript
export class QueryPerformanceMonitor {
  static async logSlowQuery(
    query: string,
    duration: number,
    params: any[],
  ): Promise<void> {
    if (duration > 1000) {
      // Log queries taking more than 1 second
      console.warn("Slow Query Detected:", {
        query,
        duration: `${duration}ms`,
        params,
        timestamp: new Date().toISOString(),
      });

      // Send to monitoring service
      await this.sendToMonitoring({
        type: "slow_query",
        query,
        duration,
        params,
      });
    }
  }

  static async sendToMonitoring(data: any): Promise<void> {
    // Implementation depends on monitoring service (e.g., DataDog, New Relic)
    if (process.env.MONITORING_ENDPOINT) {
      try {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Failed to send monitoring data:", error);
      }
    }
  }
}
```

#### 9.7.4 Performance Benchmarks

- **Database Query Response Time:** < 500ms for 95% of queries
- **API Response Time:** < 1 second for analytics endpoints
- **Dashboard Load Time:** < 3 seconds for initial load
- **Chart Rendering Time:** < 500ms for datasets up to 1000 points
- **Cache Hit Rate:** > 80% for frequently accessed data

#### 9.7.5 Scalability Considerations

##### 9.7.5.1 Database Scaling Strategy

```typescript
// Read replica configuration for analytics queries
const analyticsDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ANALYTICS_DATABASE_URL, // Read replica
    },
  },
});

export class ScalableAnalyticsService {
  // Use read replica for analytics queries
  static async getAnalyticsData(query: any) {
    return await analyticsDb.$queryRaw(query);
  }

  // Use primary database for real-time data
  static async getCurrentData(query: any) {
    return await db.$queryRaw(query);
  }
}
```

##### 9.7.5.2 Horizontal Scaling Preparation

- **Stateless API Design:** All analytics services are stateless and can be horizontally scaled
- **Database Connection Pooling:** Configured to handle multiple application instances
- **Cache Distribution:** Redis cluster support for distributed caching
- **Load Balancer Ready:** API endpoints designed for load balancer distribution

### 10. Success Metrics

#### 10.1 User Adoption

- Dashboard page views and session duration
- Export feature usage
- Location comparison feature usage

#### 10.2 Business Impact

- Improved decision-making speed
- Better resource allocation
- Enhanced operational efficiency

### 11. Implementation Timeline

#### Overview: UI-First Development Strategy

Given that a basic dashboard already exists, the recommended approach is to **scaffold the complete enhanced UI with mock data first**, then gradually integrate backend functionality. This strategy offers several advantages:

**Benefits of UI-First Approach:**

- ✅ **Faster Initial Progress**: Stakeholders can see and interact with the complete feature set immediately
- ✅ **Early Feedback**: UX and business logic can be validated before backend investment
- ✅ **Parallel Development**: Frontend and backend teams can work simultaneously
- ✅ **Reduced Risk**: Backend complexity doesn't block UI development
- ✅ **Better Testing**: UI components can be thoroughly tested with predictable mock data

#### Phase 1 (Weeks 1-2): Enhanced UI Scaffolding with Mock Data

**Week 1: Core UI Components**

- [ ] **Enhanced Metrics Cards**: Build 6 new metric cards with mock data
  - Current Utilization Rate, Average Daily Utilization Rate
  - Average Pickup Time, Unique Customers, Package Processing Time
  - Add color-coded indicators and trend arrows
- [ ] **Enhanced Date Range Picker**: Implement predefined periods (7 days, 30 days, etc.)
- [ ] **Location Selector Enhancement**: Add "All Locations" and individual location options
- [ ] **Export Controls**: Add CSV/PDF export buttons (UI only, no functionality)

**Week 2: Advanced Charts and Analytics**

- [ ] **Utilization Trends Chart**: Line chart showing both utilization metrics over time
- [ ] **Pickup Rate Analysis Chart**: Combined chart with average pickup time and distribution
- [ ] **Customer Usage Patterns Chart**: Bar chart showing customer counts and trends
- [ ] **Revenue Performance Chart**: Bar chart with revenue per location
- [ ] **Peak Capacity Heatmap**: Time-based utilization visualization
- [ ] **Processing Efficiency Chart**: Processing time trends and bottlenecks

**Mock Data Strategy for Phase 1:**

```typescript
// Enhanced mock data structure
export const mockAnalyticsData = {
  locations: [
    { id: 1, name: "Location A", storageCapacity: 500, currentPackages: 380 },
    { id: 2, name: "Location B", storageCapacity: 350, currentPackages: 220 },
    { id: 3, name: "Location C", storageCapacity: 750, currentPackages: 650 },
    { id: 4, name: "Location D", storageCapacity: 400, currentPackages: 180 },
    { id: 5, name: "Location E", storageCapacity: 600, currentPackages: 420 },
  ],

  utilizationTrends: generateMockTrendData(30), // 30 days of data
  pickupAnalytics: generateMockPickupData(),
  customerMetrics: generateMockCustomerData(),
  revenueData: generateMockRevenueData(),

  // Time-based patterns
  peakCapacityData: generateMockHeatmapData(),
  processingEfficiency: generateMockProcessingData(),
};

// Smart mock data generators that create realistic patterns
function generateMockTrendData(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: subDays(new Date(), days - i),
    currentUtilization: 60 + Math.random() * 30, // 60-90%
    avgDailyUtilization: 55 + Math.random() * 25, // 55-80%
    packages: Math.floor(200 + Math.random() * 300),
  }));
}
```

**Deliverables:**

- Complete enhanced dashboard UI with all planned features
- Interactive components with realistic mock data
- Responsive design working on all screen sizes
- Component library documentation

#### Phase 2 (Weeks 3-4): Multi-Location Comparison & Advanced Features

**Week 3: Comparison Features**

- [ ] **Location Comparison Modal**: Multi-select interface for 2-4 locations
- [ ] **Comparative Charts**: Side-by-side metrics and percentage differences
- [ ] **Comparison Export**: Mock CSV/PDF export for comparison data
- [ ] **Enhanced Recent Activity**: More detailed activity feed with filtering

**Week 4: Access Control & Polish**

- [ ] **Corporate Account UI**: Full dashboard access implementation
- [ ] **Employee Restriction Page**: Professional placeholder for limited access
- [ ] **Loading States**: Skeleton components for all charts and metrics
- [ ] **Error States**: Error handling UI for all components
- [ ] **Mobile Responsiveness**: Ensure all features work on mobile devices

**Mock Data Enhancements:**

```typescript
// Add comparison and access control mock data
export const mockComparisonData = {
  selectedLocations: [1, 3, 5],
  comparisonMetrics: generateComparisonData([1, 3, 5]),
  percentageDifferences: calculateMockDifferences(),
};

export const mockUserAccess = {
  userType: "CORPORATE", // or "EMPLOYEE"
  permissions: ["analytics_view", "export_data", "compare_locations"],
};
```

**Deliverables:**

- Complete feature set with mock data
- Access control implementation
- Comprehensive error and loading states
- Mobile-responsive design

#### Phase 3 (Weeks 5-6): Backend Integration Foundation

**Week 5: Database & API Setup**

- [ ] **Database Schema Updates**: Add `storageCapacity`, `pickedUpAt`, `processedAt` columns
- [ ] **tRPC Router Setup**: Create analytics router with all endpoints (returning mock data initially)
- [ ] **Authentication Enhancement**: Implement `protectedCorporateProcedure`
- [ ] **Database Indexing**: Add all performance indexes
- [ ] **Redis Setup**: Configure caching infrastructure

**Week 6: Core Metrics Backend Integration**

- [ ] **Current Utilization**: Replace mock data with real database queries
- [ ] **Package Counts**: Integrate real package counting logic
- [ ] **Location Data**: Connect to real location information
- [ ] **Basic Error Handling**: Implement proper error responses
- [ ] **Performance Monitoring**: Add query performance logging

**Integration Strategy:**

```typescript
// Gradual replacement approach
export const useUtilizationData = (locationId: number) => {
  const [useRealData, setUseRealData] = useState(false);

  // Feature flag for gradual rollout
  const { data: featureFlags } = api.featureFlags.get.useQuery();

  const mockData = useMockUtilizationData(locationId);
  const realData = api.analytics.getUtilization.useQuery(
    { locationId },
    { enabled: useRealData || featureFlags?.realAnalytics },
  );

  return useRealData ? realData : { data: mockData, isLoading: false };
};
```

**Deliverables:**

- Database schema updated and indexed
- Core metrics connected to real data
- Authentication and authorization working
- Performance monitoring in place

#### Phase 4 (Weeks 7-8): Advanced Analytics Integration

**Week 7: Pickup & Customer Analytics**

- [ ] **Pickup Time Calculations**: Implement real pickup analytics
- [ ] **Customer Usage Metrics**: Connect customer counting and analysis
- [ ] **Revenue Analytics**: Integrate revenue calculations
- [ ] **Time Pattern Analysis**: Implement day/hour pattern detection

**Week 8: Charts & Export Integration**

- [ ] **Chart Data Integration**: Connect all charts to real data
- [ ] **Export Functionality**: Implement CSV and PDF export
- [ ] **Comparison Backend**: Real data for location comparison
- [ ] **Cache Implementation**: Add Redis caching for performance

**Deliverables:**

- All analytics connected to real data
- Export functionality working
- Caching implemented and tested
- Performance optimized

#### Phase 5 (Week 9): Testing, Optimization & Launch

**Week 9: Final Testing & Launch Preparation**

- [ ] **Performance Testing**: Load testing with realistic data volumes
- [ ] **User Acceptance Testing**: Stakeholder testing and feedback
- [ ] **Bug Fixes**: Address any issues found during testing
- [ ] **Documentation**: Update user guides and technical documentation
- [ ] **Feature Flag Rollout**: Gradual rollout to production users

**Testing Strategy:**

```typescript
// Comprehensive testing approach
describe("Analytics Dashboard", () => {
  describe("Mock Data Phase", () => {
    // Test UI components with mock data
  });

  describe("Backend Integration Phase", () => {
    // Test real data integration
    // Test error handling
    // Test performance
  });

  describe("End-to-End", () => {
    // Test complete user workflows
    // Test export functionality
    // Test comparison features
  });
});
```

**Deliverables:**

- Production-ready analytics dashboard
- Comprehensive test coverage
- Performance benchmarks met
- User documentation complete

#### Risk Mitigation Strategies

**Technical Risks:**

- **Performance Issues**: Mock data allows UI optimization before backend complexity
- **Scope Creep**: Complete UI mockup helps lock down requirements early
- **Integration Challenges**: Gradual backend integration reduces integration risk

**Business Risks:**

- **Stakeholder Expectations**: Early UI demo manages expectations and gathers feedback
- **Timeline Pressure**: UI-first approach shows progress quickly
- **Resource Allocation**: Parallel development maximizes team efficiency

#### Success Criteria for Each Phase

**Phase 1-2 Success Criteria:**

- [ ] All planned UI components implemented and functional
- [ ] Stakeholder approval on UX and feature set
- [ ] Mobile responsiveness verified
- [ ] Component performance acceptable (< 100ms render times)

**Phase 3-4 Success Criteria:**

- [ ] All database queries performing under 500ms
- [ ] Cache hit rate > 80% for frequently accessed data
- [ ] Error handling working for all failure scenarios
- [ ] Export functionality generating correct data

**Phase 5 Success Criteria:**

- [ ] Dashboard loads in < 3 seconds
- [ ] All analytics calculations verified for accuracy
- [ ] User acceptance testing passed
- [ ] Production deployment successful

This phased approach ensures that the enhanced analytics dashboard can be developed efficiently while minimizing risk and maximizing stakeholder visibility into progress.

### 12. Future Enhancements (Post-MVP)

- Predictive analytics and forecasting
- Automated alerting system
- Real-time notifications
- Advanced customer segmentation
- Integration with external analytics tools
- Machine learning-based anomaly detection

---

This specification provides a comprehensive roadmap for enhancing the EboxSecure admin portal analytics dashboard, focusing on actionable insights that will drive operational efficiency and strategic decision-making across all warehouse locations.
