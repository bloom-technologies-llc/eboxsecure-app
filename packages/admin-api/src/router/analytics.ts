import { z } from "zod";

import { createTRPCRouter, protectedCorporateProcedure } from "../trpc";

// Input schemas for analytics queries
const analyticsInputSchema = z.object({
  locationId: z.number().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

export const analyticsRouter = createTRPCRouter({
  // Get utilization metrics for location(s)
  getUtilizationMetrics: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;

      if (locationId) {
        // Single location utilization
        const location = await ctx.db.location.findUnique({
          where: { id: locationId },
          select: { id: true, name: true, storageCapacity: true },
        });

        if (!location) {
          throw new Error("Location not found");
        }

        // Current packages count (delivered but not picked up)
        const currentPackages = await ctx.db.order.count({
          where: {
            shippedLocationId: locationId,
            deliveredDate: { not: null },
            pickedUpAt: null,
          },
        });

        // Calculate current utilization
        const currentUtilization =
          (currentPackages / location.storageCapacity) * 100;

        // Calculate average daily utilization for date range
        const dailyUtilization = await ctx.db.$queryRaw<
          Array<{ date: string; package_count: number }>
        >`
          SELECT 
            DATE("deliveredDate") as date,
            COUNT(*) as package_count
          FROM "Order" 
          WHERE "shippedLocationId" = ${locationId}
            AND "deliveredDate" >= ${dateRange.from}
            AND "deliveredDate" <= ${dateRange.to}
            AND "deliveredDate" IS NOT NULL
          GROUP BY DATE("deliveredDate")
          ORDER BY date
        `;

        let averageDailyUtilization = 0;
        if (dailyUtilization.length > 0) {
          const averagePackagesPerDay =
            dailyUtilization.reduce(
              (sum, day) => sum + Number(day.package_count),
              0,
            ) / dailyUtilization.length;
          averageDailyUtilization =
            (averagePackagesPerDay / location.storageCapacity) * 100;
        }

        return {
          locationId: location.id,
          locationName: location.name,
          currentUtilization: Math.round(currentUtilization * 10) / 10,
          averageDailyUtilization:
            Math.round(averageDailyUtilization * 10) / 10,
          storageCapacity: location.storageCapacity,
          currentPackageCount: currentPackages,
        };
      } else {
        // All locations utilization
        const locations = await ctx.db.location.findMany({
          select: { id: true, name: true, storageCapacity: true },
        });

        const utilizationData = await Promise.all(
          locations.map(async (location) => {
            // Current packages count
            const currentPackages = await ctx.db.order.count({
              where: {
                shippedLocationId: location.id,
                deliveredDate: { not: null },
                pickedUpAt: null,
              },
            });

            const currentUtilization =
              (currentPackages / location.storageCapacity) * 100;

            // Average daily utilization
            const dailyUtilization = await ctx.db.$queryRaw<
              Array<{ date: string; package_count: number }>
            >`
              SELECT 
                DATE("deliveredDate") as date,
                COUNT(*) as package_count
              FROM "Order" 
              WHERE "shippedLocationId" = ${location.id}
                AND "deliveredDate" >= ${dateRange.from}
                AND "deliveredDate" <= ${dateRange.to}
                AND "deliveredDate" IS NOT NULL
              GROUP BY DATE("deliveredDate")
              ORDER BY date
            `;

            let averageDailyUtilization = 0;
            if (dailyUtilization.length > 0) {
              const averagePackagesPerDay =
                dailyUtilization.reduce(
                  (sum, day) => sum + Number(day.package_count),
                  0,
                ) / dailyUtilization.length;
              averageDailyUtilization =
                (averagePackagesPerDay / location.storageCapacity) * 100;
            }

            return {
              locationId: location.id,
              locationName: location.name,
              currentUtilization: Math.round(currentUtilization * 10) / 10,
              averageDailyUtilization:
                Math.round(averageDailyUtilization * 10) / 10,
              storageCapacity: location.storageCapacity,
              currentPackageCount: currentPackages,
            };
          }),
        );

        return utilizationData;
      }
    }),

  // Get pickup analytics
  getPickupAnalytics: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;

      // Average pickup time in hours
      const avgPickupTime = locationId
        ? await ctx.db.$queryRaw<Array<{ avg_pickup_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 3600) as avg_pickup_hours
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "pickedUpAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
              AND "shippedLocationId" = ${locationId}
          `
        : await ctx.db.$queryRaw<Array<{ avg_pickup_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 3600) as avg_pickup_hours
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "pickedUpAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
          `;

      // Pickup distribution by time ranges
      const pickupDistribution = locationId
        ? await ctx.db.$queryRaw<
            Array<{
              same_day: number;
              one_two_day: number;
              three_five_day: number;
              six_plus_day: number;
            }>
          >`
            SELECT 
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 < 1 THEN 1 END) as same_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 > 5 THEN 1 END) as six_plus_day
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "pickedUpAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
              AND "shippedLocationId" = ${locationId}
          `
        : await ctx.db.$queryRaw<
            Array<{
              same_day: number;
              one_two_day: number;
              three_five_day: number;
              six_plus_day: number;
            }>
          >`
            SELECT 
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 < 1 THEN 1 END) as same_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM ("pickedUpAt" - "deliveredDate")) / 86400 > 5 THEN 1 END) as six_plus_day
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "pickedUpAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
          `;

      return {
        averagePickupTime: avgPickupTime[0]?.avg_pickup_hours || 0,
        pickupDistribution: {
          sameDay: Number(pickupDistribution[0]?.same_day || 0),
          oneTwoDay: Number(pickupDistribution[0]?.one_two_day || 0),
          threeFiveDay: Number(pickupDistribution[0]?.three_five_day || 0),
          sixPlusDay: Number(pickupDistribution[0]?.six_plus_day || 0),
        },
      };
    }),

  // Get customer usage metrics
  getCustomerUsageMetrics: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;

      const result = locationId
        ? await ctx.db.$queryRaw<
            Array<{
              unique_customers: number;
              new_customers: number;
              returning_customers: number;
              total_packages: number;
            }>
          >`
            WITH customer_stats AS (
              SELECT 
                o."customerId",
                COUNT(*) as package_count,
                (
                  SELECT MIN("deliveredDate") 
                  FROM "Order" o2 
                  WHERE o2."customerId" = o."customerId" 
                    AND o2."shippedLocationId" = ${locationId}
                    AND o2."deliveredDate" IS NOT NULL
                ) as first_ever_delivery_at_location
              FROM "Order" o
              WHERE o."deliveredDate" >= ${dateRange.from}
                AND o."deliveredDate" <= ${dateRange.to}
                AND o."deliveredDate" IS NOT NULL
                AND o."shippedLocationId" = ${locationId}
              GROUP BY o."customerId"
            )
            SELECT 
              COUNT(DISTINCT "customerId") as unique_customers,
              COUNT(CASE WHEN first_ever_delivery_at_location >= ${dateRange.from} THEN 1 END) as new_customers,
              COUNT(CASE WHEN first_ever_delivery_at_location < ${dateRange.from} THEN 1 END) as returning_customers,
              SUM(package_count) as total_packages
            FROM customer_stats
          `
        : await ctx.db.$queryRaw<
            Array<{
              unique_customers: number;
              new_customers: number;
              returning_customers: number;
              total_packages: number;
            }>
          >`
            WITH customer_stats AS (
              SELECT 
                o."customerId",
                COUNT(*) as package_count,
                (
                  SELECT MIN("deliveredDate") 
                  FROM "Order" o2 
                  WHERE o2."customerId" = o."customerId" 
                    AND o2."deliveredDate" IS NOT NULL
                ) as first_ever_delivery_at_location
              FROM "Order" o
              WHERE o."deliveredDate" >= ${dateRange.from}
                AND o."deliveredDate" <= ${dateRange.to}
                AND o."deliveredDate" IS NOT NULL
              GROUP BY o."customerId"
            )
            SELECT 
              COUNT(DISTINCT "customerId") as unique_customers,
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
        totalPackages,
      };
    }),

  // Get revenue analytics
  getRevenueAnalytics: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;

      const result = locationId
        ? await ctx.db.$queryRaw<
            Array<{
              total_revenue: number;
              package_count: number;
            }>
          >`
            SELECT 
              SUM(total) as total_revenue,
              COUNT(*) as package_count
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "deliveredDate" IS NOT NULL
              AND "shippedLocationId" = ${locationId}
          `
        : await ctx.db.$queryRaw<
            Array<{
              total_revenue: number;
              package_count: number;
            }>
          >`
            SELECT 
              SUM(total) as total_revenue,
              COUNT(*) as package_count
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "deliveredDate" IS NOT NULL
          `;

      const monthlyTrend = locationId
        ? await ctx.db.$queryRaw<
            Array<{
              month: string;
              revenue: number;
            }>
          >`
            SELECT 
              TO_CHAR("deliveredDate", 'YYYY-MM') as month,
              SUM(total) as revenue
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "deliveredDate" IS NOT NULL
              AND "shippedLocationId" = ${locationId}
            GROUP BY TO_CHAR("deliveredDate", 'YYYY-MM')
            ORDER BY month
          `
        : await ctx.db.$queryRaw<
            Array<{
              month: string;
              revenue: number;
            }>
          >`
            SELECT 
              TO_CHAR("deliveredDate", 'YYYY-MM') as month,
              SUM(total) as revenue
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "deliveredDate" IS NOT NULL
            GROUP BY TO_CHAR("deliveredDate", 'YYYY-MM')
            ORDER BY month
          `;

      const data = result[0];
      const totalRevenue = Number(data?.total_revenue || 0);
      const packageCount = Number(data?.package_count || 0);

      return {
        totalRevenue,
        packageCount,
        averageRevenuePerPackage:
          packageCount > 0 ? totalRevenue / packageCount : 0,
        monthlyRevenueTrend: monthlyTrend.map((row) => ({
          month: row.month,
          revenue: Number(row.revenue),
        })),
      };
    }),

  // Get processing time analytics
  getProcessingTimeAnalytics: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;

      const avgProcessingTime = locationId
        ? await ctx.db.$queryRaw<Array<{ avg_processing_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("processedAt" - "deliveredDate")) / 3600) as avg_processing_hours
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "processedAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
              AND "shippedLocationId" = ${locationId}
          `
        : await ctx.db.$queryRaw<Array<{ avg_processing_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("processedAt" - "deliveredDate")) / 3600) as avg_processing_hours
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "processedAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
          `;

      return {
        averageProcessingTime: avgProcessingTime[0]?.avg_processing_hours || 0,
      };
    }),

  // Get utilization trends over time (for charts)
  getUtilizationTrends: protectedCorporateProcedure
    .input(
      analyticsInputSchema.extend({
        days: z.number().default(30), // Number of days to fetch trends for
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange, days } = input;

      // TODO: Add Redis caching here for performance
      const trends = locationId
        ? await ctx.db.$queryRaw<
            Array<{
              date: string;
              package_count: number;
              current_packages: number;
              storage_capacity: number;
            }>
          >`
            WITH RECURSIVE date_series AS (
              SELECT ${dateRange.from}::date as date
              UNION ALL
              SELECT date + INTERVAL '1 day'
              FROM date_series
              WHERE date < ${dateRange.to}::date
            ),
            daily_packages AS (
              SELECT 
                DATE("deliveredDate") as date,
                COUNT(*) as package_count
              FROM "Order" 
              WHERE "deliveredDate" >= ${dateRange.from}
                AND "deliveredDate" <= ${dateRange.to}
                AND "deliveredDate" IS NOT NULL
                AND "shippedLocationId" = ${locationId}
              GROUP BY DATE("deliveredDate")
            ),
            location_info AS (
              SELECT storage_capacity
              FROM "Location" WHERE id = ${locationId}
            )
            SELECT 
              ds.date::text,
              COALESCE(dp.package_count, 0) as package_count,
              COALESCE(dp.package_count, 0) as current_packages,
              li.storage_capacity
            FROM date_series ds
            LEFT JOIN daily_packages dp ON ds.date = dp.date
            CROSS JOIN location_info li
            ORDER BY ds.date
          `
        : await ctx.db.$queryRaw<
            Array<{
              date: string;
              package_count: number;
              current_packages: number;
              storage_capacity: number;
            }>
          >`
            WITH RECURSIVE date_series AS (
              SELECT ${dateRange.from}::date as date
              UNION ALL
              SELECT date + INTERVAL '1 day'
              FROM date_series
              WHERE date < ${dateRange.to}::date
            ),
            daily_packages AS (
              SELECT 
                DATE("deliveredDate") as date,
                COUNT(*) as package_count
              FROM "Order" 
              WHERE "deliveredDate" >= ${dateRange.from}
                AND "deliveredDate" <= ${dateRange.to}
                AND "deliveredDate" IS NOT NULL
              GROUP BY DATE("deliveredDate")
            )
            SELECT 
              ds.date::text,
              COALESCE(dp.package_count, 0) as package_count,
              COALESCE(dp.package_count, 0) as current_packages,
              500 as storage_capacity
            FROM date_series ds
            LEFT JOIN daily_packages dp ON ds.date = dp.date
            ORDER BY ds.date
          `;

      return trends.map((trend) => ({
        date: trend.date,
        currentUtilization:
          (Number(trend.current_packages) / Number(trend.storage_capacity)) *
          100,
        averageDailyUtilization:
          (Number(trend.package_count) / Number(trend.storage_capacity)) * 100,
        packageCount: Number(trend.package_count),
      }));
    }),

  // Get all locations for selection
  getLocations: protectedCorporateProcedure.query(async ({ ctx }) => {
    // TODO: Add Redis caching here for performance
    return await ctx.db.location.findMany({
      select: {
        id: true,
        name: true,
        storageCapacity: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }),

  // Export analytics data (placeholder for Phase 4)
  exportAnalyticsData: protectedCorporateProcedure
    .input(
      analyticsInputSchema.extend({
        format: z.enum(["csv", "pdf"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement actual export functionality in Phase 4
      return {
        success: true,
        message: `Export functionality for ${input.format.toUpperCase()} will be available in Phase 4`,
        downloadUrl: null,
      };
    }),
});
