import { Prisma } from "@prisma/client";
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

// Type definitions for activity data
interface ActivityItem {
  id: string;
  type: "delivery" | "pickup" | "processing" | "alert";
  title: string;
  description: string;
  location: string;
  locationId: number;
  customerId: string | null;
  timestamp: Date;
  status: "completed" | "ready" | "warning";
  priority: "normal" | "medium" | "high";
  packageCount: number | null;
  revenue: number | null;
  orderId: number | null;
}

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
              AVG(EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 3600) as avg_pickup_hours
            FROM "Order" o
            WHERE o."deliveredDate" >= ${dateRange.from}
              AND o."deliveredDate" <= ${dateRange.to}
              AND o."pickedUpAt" IS NOT NULL
              AND o."deliveredDate" IS NOT NULL
              AND o."shippedLocationId" = ${locationId}
          `
        : await ctx.db.$queryRaw<Array<{ avg_pickup_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 3600) as avg_pickup_hours
            FROM "Order" o
            WHERE o."deliveredDate" >= ${dateRange.from}
              AND o."deliveredDate" <= ${dateRange.to}
              AND o."pickedUpAt" IS NOT NULL
              AND o."deliveredDate" IS NOT NULL
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
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 < 1 THEN 1 END) as same_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 > 5 THEN 1 END) as six_plus_day
            FROM "Order" o
            WHERE o."deliveredDate" >= ${dateRange.from}
              AND o."deliveredDate" <= ${dateRange.to}
              AND o."pickedUpAt" IS NOT NULL
              AND o."deliveredDate" IS NOT NULL
              AND o."shippedLocationId" = ${locationId}
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
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 < 1 THEN 1 END) as same_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
              COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 > 5 THEN 1 END) as six_plus_day
            FROM "Order" o
            WHERE o."deliveredDate" >= ${dateRange.from}
              AND o."deliveredDate" <= ${dateRange.to}
              AND o."pickedUpAt" IS NOT NULL
              AND o."deliveredDate" IS NOT NULL
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
  // Get processing time analytics
  getProcessingTimeAnalytics: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;

      const avgProcessingTime = locationId
        ? await ctx.db.$queryRaw<Array<{ avg_processing_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("processedAt"::timestamp - "deliveredDate"::timestamp))::float / 3600) as avg_processing_hours
            FROM "Order"
            WHERE "deliveredDate" >= ${dateRange.from}
              AND "deliveredDate" <= ${dateRange.to}
              AND "processedAt" IS NOT NULL
              AND "deliveredDate" IS NOT NULL
              AND "shippedLocationId" = ${locationId}
          `
        : await ctx.db.$queryRaw<Array<{ avg_processing_hours: number }>>`
            SELECT 
              AVG(EXTRACT(EPOCH FROM ("processedAt"::timestamp - "deliveredDate"::timestamp))::float / 3600) as avg_processing_hours
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
              SELECT DATE(${dateRange.from}) as date
              UNION ALL
              SELECT (date + INTERVAL '1 day')::date
              FROM date_series
              WHERE date < DATE(${dateRange.to})
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
            current_packages_per_day AS (
              SELECT 
                ds.date,
                COUNT(o.id) as packages_in_storage
              FROM date_series ds
              LEFT JOIN "Order" o ON o."shippedLocationId" = ${locationId}
                AND DATE(o."deliveredDate") <= ds.date
                AND (o."pickedUpAt" IS NULL OR DATE(o."pickedUpAt") > ds.date)
                AND o."deliveredDate" IS NOT NULL
              GROUP BY ds.date
            ),
            location_info AS (
              SELECT "storageCapacity" as storage_capacity
              FROM "Location" WHERE id = ${locationId}
            )
            SELECT 
              ds.date::text,
              COALESCE(dp.package_count, 0) as package_count,
              COALESCE(cp.packages_in_storage, 0) as current_packages,
              li.storage_capacity
            FROM date_series ds
            LEFT JOIN daily_packages dp ON ds.date = dp.date
            LEFT JOIN current_packages_per_day cp ON ds.date = cp.date
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
              SELECT DATE(${dateRange.from}) as date
              UNION ALL
              SELECT (date + INTERVAL '1 day')::date
              FROM date_series
              WHERE date < DATE(${dateRange.to})
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
            ),
            current_packages_per_day AS (
              SELECT 
                ds.date,
                AVG(packages_in_storage) as avg_packages_in_storage
              FROM date_series ds
              LEFT JOIN (
                SELECT 
                  ds2.date,
                  o."shippedLocationId",
                  COUNT(o.id) as packages_in_storage
                FROM date_series ds2
                CROSS JOIN "Location" l
                LEFT JOIN "Order" o ON o."shippedLocationId" = l.id
                  AND DATE(o."deliveredDate") <= ds2.date
                  AND (o."pickedUpAt" IS NULL OR DATE(o."pickedUpAt") > ds2.date)
                  AND o."deliveredDate" IS NOT NULL
                GROUP BY ds2.date, o."shippedLocationId", l.id
              ) location_packages ON ds.date = location_packages.date
              GROUP BY ds.date
            )
            SELECT 
              ds.date::text,
              COALESCE(dp.package_count, 0) as package_count,
              COALESCE(ROUND(cp.avg_packages_in_storage), 0) as current_packages,
              500 as storage_capacity
            FROM date_series ds
            LEFT JOIN daily_packages dp ON ds.date = dp.date
            LEFT JOIN current_packages_per_day cp ON ds.date = cp.date
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

  // Get recent activity across all locations or specific location
  getRecentActivity: protectedCorporateProcedure
    .input(
      z.object({
        locationId: z.number().optional(),
        limit: z.number().default(20),
        activityTypes: z
          .array(z.enum(["delivery", "pickup", "processing", "alert"]))
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, limit, activityTypes } = input;
      // TODO: Add Redis caching for performance optimization

      const activities: ActivityItem[] = [];

      // Get recent deliveries
      if (!activityTypes || activityTypes.includes("delivery")) {
        const deliveries = await ctx.db.$queryRaw<
          Array<{
            id: number;
            customer_id: string;
            vendor_order_id: string;
            total: number;
            delivered_date: Date;
            location_id: number;
            location_name: string;
          }>
        >`
          SELECT 
            o.id,
            o."customerId" as customer_id,
            o."vendorOrderId" as vendor_order_id,
            o.total,
            o."deliveredDate" as delivered_date,
            l.id as location_id,
            l.name as location_name
          FROM "Order" o
          JOIN "Location" l ON o."shippedLocationId" = l.id
          WHERE o."deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
          ORDER BY o."deliveredDate" DESC
          LIMIT ${Math.ceil(limit / 3)}
        `;

        deliveries.forEach((delivery) => {
          activities.push({
            id: `delivery-${delivery.id}`,
            type: "delivery" as const,
            title: "Package Delivered",
            description: `Order #${delivery.vendor_order_id} delivered`,
            location: delivery.location_name,
            locationId: delivery.location_id,
            customerId: delivery.customer_id,
            timestamp: delivery.delivered_date,
            status: "completed" as const,
            priority: "normal" as const,
            packageCount: 1,
            revenue: Number(delivery.total),
            orderId: delivery.id,
          });
        });
      }

      // Get recent pickups
      if (!activityTypes || activityTypes.includes("pickup")) {
        const pickups = await ctx.db.$queryRaw<
          Array<{
            id: number;
            customer_id: string;
            vendor_order_id: string;
            total: number;
            picked_up_at: Date;
            delivered_date: Date;
            location_id: number;
            location_name: string;
          }>
        >`
          SELECT 
            o.id,
            o."customerId" as customer_id,
            o."vendorOrderId" as vendor_order_id,
            o.total,
            o."pickedUpAt" as picked_up_at,
            o."deliveredDate" as delivered_date,
            l.id as location_id,
            l.name as location_name
          FROM "Order" o
          JOIN "Location" l ON o."shippedLocationId" = l.id
          WHERE o."pickedUpAt" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
          ORDER BY o."pickedUpAt" DESC
          LIMIT ${Math.ceil(limit / 3)}
        `;

        pickups.forEach((pickup) => {
          activities.push({
            id: `pickup-${pickup.id}`,
            type: "pickup" as const,
            title: "Package Picked Up",
            description: `Order #${pickup.vendor_order_id} collected by customer`,
            location: pickup.location_name,
            locationId: pickup.location_id,
            customerId: pickup.customer_id,
            timestamp: pickup.picked_up_at,
            status: "completed" as const,
            priority: "normal" as const,
            packageCount: 1,
            revenue: Number(pickup.total),
            orderId: pickup.id,
          });
        });
      }

      // Get recent processing activities
      if (!activityTypes || activityTypes.includes("processing")) {
        const processed = await ctx.db.$queryRaw<
          Array<{
            id: number;
            customer_id: string;
            vendor_order_id: string;
            total: number;
            processed_at: Date;
            location_id: number;
            location_name: string;
          }>
        >`
          SELECT 
            o.id,
            o."customerId" as customer_id,
            o."vendorOrderId" as vendor_order_id,
            o.total,
            o."processedAt" as processed_at,
            l.id as location_id,
            l.name as location_name
          FROM "Order" o
          JOIN "Location" l ON o."shippedLocationId" = l.id
          WHERE o."processedAt" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
          ORDER BY o."processedAt" DESC
          LIMIT ${Math.ceil(limit / 3)}
        `;

        processed.forEach((process) => {
          activities.push({
            id: `processing-${process.id}`,
            type: "processing" as const,
            title: "Package Processed",
            description: `Order #${process.vendor_order_id} ready for pickup`,
            location: process.location_name,
            locationId: process.location_id,
            customerId: process.customer_id,
            timestamp: process.processed_at,
            status: "ready" as const,
            priority: "normal" as const,
            packageCount: 1,
            revenue: Number(process.total),
            orderId: process.id,
          });
        });
      }

      // Generate alerts based on business logic
      if (!activityTypes || activityTypes.includes("alert")) {
        // High utilization alerts
        const highUtilizationLocations = await ctx.db.$queryRaw<
          Array<{
            location_id: number;
            location_name: string;
            current_packages: number;
            storage_capacity: number;
            utilization: number;
          }>
        >`
          WITH current_utilization AS (
            SELECT 
              l.id as location_id,
              l.name as location_name,
              COUNT(o.id) as current_packages,
              l."storageCapacity" as storage_capacity,
              (COUNT(o.id) * 100.0 / l."storageCapacity") as utilization
            FROM "Location" l
            LEFT JOIN "Order" o ON l.id = o."shippedLocationId" 
              AND o."deliveredDate" IS NOT NULL 
              AND o."pickedUpAt" IS NULL
            WHERE l."storageCapacity" > 0
              ${locationId ? Prisma.sql`AND l.id = ${locationId}` : Prisma.empty}
            GROUP BY l.id, l.name, l."storageCapacity"
          )
          SELECT * FROM current_utilization
          WHERE utilization > 85
          ORDER BY utilization DESC
        `;

        highUtilizationLocations.forEach((location) => {
          activities.push({
            id: `alert-high-util-${location.location_id}`,
            type: "alert" as const,
            title: "High Utilization Alert",
            description: `${location.location_name} is at ${Math.round(location.utilization)}% capacity`,
            location: location.location_name,
            locationId: location.location_id,
            customerId: null,
            timestamp: new Date(),
            status: "warning" as const,
            priority:
              location.utilization > 95
                ? ("high" as const)
                : ("medium" as const),
            packageCount: location.current_packages,
            revenue: null,
            orderId: null,
          });
        });

        // Delayed pickup alerts (packages not picked up for >48 hours)
        const delayedPickups = await ctx.db.$queryRaw<
          Array<{
            id: number;
            customer_id: string;
            vendor_order_id: string;
            delivered_date: Date;
            location_id: number;
            location_name: string;
            hours_since_delivery: number;
          }>
        >`
          SELECT 
            o.id,
            o."customerId" as customer_id,
            o."vendorOrderId" as vendor_order_id,
            o."deliveredDate" as delivered_date,
            l.id as location_id,
            l.name as location_name,
            EXTRACT(EPOCH FROM (NOW()::timestamp - o."deliveredDate"::timestamp))::float / 3600 as hours_since_delivery
          FROM "Order" o
          JOIN "Location" l ON o."shippedLocationId" = l.id
          WHERE o."deliveredDate" IS NOT NULL
            AND o."pickedUpAt" IS NULL
            AND o."deliveredDate"::timestamp < (NOW() - INTERVAL '48 hours')::timestamp
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
          ORDER BY o."deliveredDate" ASC
          LIMIT 10
        `;

        delayedPickups.forEach((delayed) => {
          const daysDelayed = Math.floor(
            Number(delayed.hours_since_delivery) / 24,
          );
          activities.push({
            id: `alert-delayed-${delayed.id}`,
            type: "alert" as const,
            title: "Delayed Pickup Alert",
            description: `Order #${delayed.vendor_order_id} awaiting pickup for ${daysDelayed} days`,
            location: delayed.location_name,
            locationId: delayed.location_id,
            customerId: delayed.customer_id,
            timestamp: new Date(),
            status: "warning" as const,
            priority: daysDelayed > 7 ? ("high" as const) : ("medium" as const),
            packageCount: 1,
            revenue: null,
            orderId: delayed.id,
          });
        });
      }

      // Sort all activities by timestamp and limit
      const sortedActivities = activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, limit);

      return sortedActivities;
    }),

  // Get historical trend comparison (current vs previous period)
  getHistoricalTrendComparison: protectedCorporateProcedure
    .input(analyticsInputSchema)
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange } = input;
      // TODO: Add Redis caching for performance optimization

      // Calculate the previous period (same duration as current)
      const rangeDuration = dateRange.to.getTime() - dateRange.from.getTime();
      const previousPeriodEnd = new Date(dateRange.from.getTime() - 1); // Day before current period starts
      const previousPeriodStart = new Date(
        previousPeriodEnd.getTime() - rangeDuration,
      );

      // Get current period metrics
      const [
        currentUtilization,
        currentPickup,
        currentCustomer,
        currentRevenue,
      ] = await Promise.all([
        // Current utilization
        ctx.db.$queryRaw<
          Array<{ avg_utilization: number; package_count: number }>
        >`
          SELECT 
            AVG(daily_packages * 100.0 / storage_capacity) as avg_utilization,
            SUM(daily_packages) as package_count
          FROM (
            SELECT 
              l."storageCapacity" as storage_capacity,
              COUNT(o.id) as daily_packages
            FROM "Location" l
            LEFT JOIN "Order" o ON l.id = o."shippedLocationId" 
              AND o."deliveredDate" >= ${dateRange.from}
              AND o."deliveredDate" <= ${dateRange.to}
              AND o."deliveredDate" IS NOT NULL
              ${locationId ? Prisma.sql`AND l.id = ${locationId}` : Prisma.empty}
            GROUP BY l.id, l."storageCapacity"
          ) utilization_data
        `,

        // Current pickup metrics
        ctx.db.$queryRaw<
          Array<{ avg_pickup_hours: number; pickup_count: number }>
        >`
          SELECT 
            AVG(EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 3600) as avg_pickup_hours,
            COUNT(*) as pickup_count
          FROM "Order" o
          WHERE o."deliveredDate" >= ${dateRange.from}
            AND o."deliveredDate" <= ${dateRange.to}
            AND o."pickedUpAt" IS NOT NULL
            AND o."deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
        `,

        // Current customer metrics
        ctx.db.$queryRaw<
          Array<{ unique_customers: number; total_packages: number }>
        >`
          SELECT 
            COUNT(DISTINCT o."customerId") as unique_customers,
            COUNT(*) as total_packages
          FROM "Order" o
          WHERE o."deliveredDate" >= ${dateRange.from}
            AND o."deliveredDate" <= ${dateRange.to}
            AND o."deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
        `,

        // Current revenue metrics
        ctx.db.$queryRaw<
          Array<{ total_revenue: number; package_count: number }>
        >`
          SELECT 
            SUM(total) as total_revenue,
            COUNT(*) as package_count
          FROM "Order"
          WHERE "deliveredDate" >= ${dateRange.from}
            AND "deliveredDate" <= ${dateRange.to}
            AND "deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND "shippedLocationId" = ${locationId}` : Prisma.empty}
        `,
      ]);

      // Get previous period metrics
      const [
        previousUtilization,
        previousPickup,
        previousCustomer,
        previousRevenue,
      ] = await Promise.all([
        // Previous utilization
        ctx.db.$queryRaw<
          Array<{ avg_utilization: number; package_count: number }>
        >`
          SELECT 
            AVG(daily_packages * 100.0 / storage_capacity) as avg_utilization,
            SUM(daily_packages) as package_count
          FROM (
            SELECT 
              l."storageCapacity" as storage_capacity,
              COUNT(o.id) as daily_packages
            FROM "Location" l
            LEFT JOIN "Order" o ON l.id = o."shippedLocationId" 
              AND o."deliveredDate" >= ${previousPeriodStart}
              AND o."deliveredDate" <= ${previousPeriodEnd}
              AND o."deliveredDate" IS NOT NULL
              ${locationId ? Prisma.sql`AND l.id = ${locationId}` : Prisma.empty}
            GROUP BY l.id, l."storageCapacity"
          ) utilization_data
        `,

        // Previous pickup metrics
        ctx.db.$queryRaw<
          Array<{ avg_pickup_hours: number; pickup_count: number }>
        >`
          SELECT 
            AVG(EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 3600) as avg_pickup_hours,
            COUNT(*) as pickup_count
          FROM "Order" o
          WHERE o."deliveredDate" >= ${previousPeriodStart}
            AND o."deliveredDate" <= ${previousPeriodEnd}
            AND o."pickedUpAt" IS NOT NULL
            AND o."deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
        `,

        // Previous customer metrics
        ctx.db.$queryRaw<
          Array<{ unique_customers: number; total_packages: number }>
        >`
          SELECT 
            COUNT(DISTINCT o."customerId") as unique_customers,
            COUNT(*) as total_packages
          FROM "Order" o
          WHERE o."deliveredDate" >= ${previousPeriodStart}
            AND o."deliveredDate" <= ${previousPeriodEnd}
            AND o."deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND o."shippedLocationId" = ${locationId}` : Prisma.empty}
        `,

        // Previous revenue metrics
        ctx.db.$queryRaw<
          Array<{ total_revenue: number; package_count: number }>
        >`
          SELECT 
            SUM(total) as total_revenue,
            COUNT(*) as package_count
          FROM "Order"
          WHERE "deliveredDate" >= ${previousPeriodStart}
            AND "deliveredDate" <= ${previousPeriodEnd}
            AND "deliveredDate" IS NOT NULL
            ${locationId ? Prisma.sql`AND "shippedLocationId" = ${locationId}` : Prisma.empty}
        `,
      ]);

      // Calculate percentage changes
      const calculatePercentageChange = (
        current: number,
        previous: number,
      ): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const currentUtilizationValue = Number(
        currentUtilization[0]?.avg_utilization || 0,
      );
      const previousUtilizationValue = Number(
        previousUtilization[0]?.avg_utilization || 0,
      );

      const currentPickupTime = Number(currentPickup[0]?.avg_pickup_hours || 0);
      const previousPickupTime = Number(
        previousPickup[0]?.avg_pickup_hours || 0,
      );

      const currentCustomerCount = Number(
        currentCustomer[0]?.unique_customers || 0,
      );
      const previousCustomerCount = Number(
        previousCustomer[0]?.unique_customers || 0,
      );

      const currentRevenueValue = Number(currentRevenue[0]?.total_revenue || 0);
      const previousRevenueValue = Number(
        previousRevenue[0]?.total_revenue || 0,
      );

      const currentPackageCount = Number(
        currentUtilization[0]?.package_count || 0,
      );
      const previousPackageCount = Number(
        previousUtilization[0]?.package_count || 0,
      );

      return {
        periodComparison: {
          current: {
            from: dateRange.from,
            to: dateRange.to,
          },
          previous: {
            from: previousPeriodStart,
            to: previousPeriodEnd,
          },
        },
        metrics: {
          utilization: {
            current: Math.round(currentUtilizationValue * 10) / 10,
            previous: Math.round(previousUtilizationValue * 10) / 10,
            change:
              Math.round(
                calculatePercentageChange(
                  currentUtilizationValue,
                  previousUtilizationValue,
                ) * 10,
              ) / 10,
            trend:
              currentUtilizationValue >= previousUtilizationValue
                ? "up"
                : "down",
          },
          pickupTime: {
            current: Math.round(currentPickupTime * 10) / 10,
            previous: Math.round(previousPickupTime * 10) / 10,
            change:
              Math.round(
                calculatePercentageChange(
                  currentPickupTime,
                  previousPickupTime,
                ) * 10,
              ) / 10,
            trend: currentPickupTime <= previousPickupTime ? "up" : "down", // Lower pickup time is better
          },
          customers: {
            current: currentCustomerCount,
            previous: previousCustomerCount,
            change:
              Math.round(
                calculatePercentageChange(
                  currentCustomerCount,
                  previousCustomerCount,
                ) * 10,
              ) / 10,
            trend:
              currentCustomerCount >= previousCustomerCount ? "up" : "down",
          },
          revenue: {
            current: Math.round(currentRevenueValue * 100) / 100,
            previous: Math.round(previousRevenueValue * 100) / 100,
            change:
              Math.round(
                calculatePercentageChange(
                  currentRevenueValue,
                  previousRevenueValue,
                ) * 10,
              ) / 10,
            trend: currentRevenueValue >= previousRevenueValue ? "up" : "down",
          },
          packages: {
            current: currentPackageCount,
            previous: previousPackageCount,
            change:
              Math.round(
                calculatePercentageChange(
                  currentPackageCount,
                  previousPackageCount,
                ) * 10,
              ) / 10,
            trend: currentPackageCount >= previousPackageCount ? "up" : "down",
          },
        },
      };
    }),

  // Peak Capacity Analysis - Hour-by-hour utilization patterns
  getPeakCapacityAnalysis: protectedCorporateProcedure
    .input(
      analyticsInputSchema.extend({
        granularity: z.enum(["hourly", "daily", "weekly"]).default("hourly"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { locationId, dateRange, granularity } = input;
      // TODO: Add Redis caching here for performance

      if (granularity === "hourly") {
        // Hour-by-hour utilization patterns
        const hourlyPatterns = locationId
          ? await ctx.db.$queryRaw<
              Array<{
                hour: number;
                day_of_week: number;
                avg_utilization: number;
                peak_utilization: number;
                package_count: number;
                total_deliveries: number;
              }>
            >`
              WITH hourly_data AS (
                SELECT 
                  EXTRACT(HOUR FROM o."deliveredDate") as hour,
                  EXTRACT(DOW FROM o."deliveredDate") as day_of_week,
                  DATE(o."deliveredDate") as delivery_date,
                  COUNT(*) as packages_delivered
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."deliveredDate" IS NOT NULL
                  AND o."shippedLocationId" = ${locationId}
                GROUP BY 
                  EXTRACT(HOUR FROM o."deliveredDate"),
                  EXTRACT(DOW FROM o."deliveredDate"),
                  DATE(o."deliveredDate")
              ),
              location_capacity AS (
                SELECT "storageCapacity" as capacity
                FROM "Location" WHERE id = ${locationId}
              )
              SELECT 
                hd.hour::integer,
                hd.day_of_week::integer,
                ROUND(AVG(hd.packages_delivered * 100.0 / lc.capacity), 2) as avg_utilization,
                ROUND(MAX(hd.packages_delivered * 100.0 / lc.capacity), 2) as peak_utilization,
                ROUND(AVG(hd.packages_delivered), 1) as package_count,
                SUM(hd.packages_delivered) as total_deliveries
              FROM hourly_data hd
              CROSS JOIN location_capacity lc
              GROUP BY hd.hour, hd.day_of_week
              ORDER BY hd.day_of_week, hd.hour
            `
          : await ctx.db.$queryRaw<
              Array<{
                hour: number;
                day_of_week: number;
                avg_utilization: number;
                peak_utilization: number;
                package_count: number;
                total_deliveries: number;
              }>
            >`
              WITH hourly_data AS (
                SELECT 
                  EXTRACT(HOUR FROM o."deliveredDate") as hour,
                  EXTRACT(DOW FROM o."deliveredDate") as day_of_week,
                  DATE(o."deliveredDate") as delivery_date,
                  o."shippedLocationId" as location_id,
                  COUNT(*) as packages_delivered
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."deliveredDate" IS NOT NULL
                GROUP BY 
                  EXTRACT(HOUR FROM o."deliveredDate"),
                  EXTRACT(DOW FROM o."deliveredDate"),
                  DATE(o."deliveredDate"),
                  o."shippedLocationId"
              ),
              location_capacity AS (
                SELECT l.id as location_id, l."storageCapacity" as capacity
                FROM "Location" l
              )
              SELECT 
                hd.hour::integer,
                hd.day_of_week::integer,
                ROUND(AVG(hd.packages_delivered * 100.0 / lc.capacity), 2) as avg_utilization,
                ROUND(MAX(hd.packages_delivered * 100.0 / lc.capacity), 2) as peak_utilization,
                ROUND(AVG(hd.packages_delivered), 1) as package_count,
                SUM(hd.packages_delivered) as total_deliveries
              FROM hourly_data hd
              JOIN location_capacity lc ON hd.location_id = lc.location_id
              GROUP BY hd.hour, hd.day_of_week
              ORDER BY hd.day_of_week, hd.hour
            `;

        // Transform data into heatmap format
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const heatmapData = dayNames.map((dayName, dayIndex) => ({
          day: dayName,
          dayOfWeek: dayIndex,
          hours: Array.from({ length: 24 }, (_, hour) => {
            const hourData = hourlyPatterns.find(
              (p) => p.hour === hour && p.day_of_week === dayIndex,
            );
            return {
              hour,
              utilization: Number(hourData?.avg_utilization || 0),
              peakUtilization: Number(hourData?.peak_utilization || 0),
              packageCount: Number(hourData?.package_count || 0),
              totalDeliveries: Number(hourData?.total_deliveries || 0),
            };
          }),
        }));

        // Calculate peak hours across all days
        const hourlyAverages = Array.from({ length: 24 }, (_, hour) => {
          const hourData = hourlyPatterns.filter((p) => p.hour === hour);
          const avgUtilization =
            hourData.length > 0
              ? hourData.reduce(
                  (sum, h) => sum + Number(h.avg_utilization),
                  0,
                ) / hourData.length
              : 0;
          const totalPackages = hourData.reduce(
            (sum, h) => sum + Number(h.total_deliveries),
            0,
          );

          return {
            hour,
            avgUtilization: Math.round(avgUtilization * 10) / 10,
            totalPackages,
          };
        });

        const peakHours = hourlyAverages
          .sort((a, b) => b.avgUtilization - a.avgUtilization)
          .slice(0, 3);

        // Calculate weekly patterns
        const weeklyPatterns = dayNames.map((dayName, dayIndex) => {
          const dayData = hourlyPatterns.filter(
            (p) => p.day_of_week === dayIndex,
          );
          const dayAvg =
            dayData.length > 0
              ? dayData.reduce((sum, h) => sum + Number(h.avg_utilization), 0) /
                dayData.length
              : 0;
          const dayPeak =
            dayData.length > 0
              ? Math.max(...dayData.map((h) => Number(h.peak_utilization)))
              : 0;
          const totalPackages = dayData.reduce(
            (sum, h) => sum + Number(h.total_deliveries),
            0,
          );

          return {
            day: dayName,
            dayOfWeek: dayIndex,
            avgUtilization: Math.round(dayAvg * 10) / 10,
            peakUtilization: Math.round(dayPeak * 10) / 10,
            totalPackages,
          };
        });

        return {
          granularity: "hourly" as const,
          heatmapData,
          peakHours,
          weeklyPatterns,
          insights: {
            busiestHour: peakHours[0]?.hour || 0,
            busiestDay: weeklyPatterns.reduce((max, day) =>
              day.avgUtilization > max.avgUtilization ? day : max,
            ).day,
            averageUtilization:
              Math.round(
                (weeklyPatterns.reduce(
                  (sum, day) => sum + day.avgUtilization,
                  0,
                ) /
                  weeklyPatterns.length) *
                  10,
              ) / 10,
            peakUtilization: Math.max(
              ...weeklyPatterns.map((day) => day.peakUtilization),
            ),
          },
        };
      } else if (granularity === "daily") {
        // Daily patterns over the date range
        const dailyPatterns = locationId
          ? await ctx.db.$queryRaw<
              Array<{
                date: string;
                packages_delivered: number;
                utilization: number;
                day_of_week: number;
              }>
            >`
              WITH daily_data AS (
                SELECT 
                  DATE(o."deliveredDate") as date,
                  EXTRACT(DOW FROM o."deliveredDate") as day_of_week,
                  COUNT(*) as packages_delivered
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."deliveredDate" IS NOT NULL
                  AND o."shippedLocationId" = ${locationId}
                GROUP BY DATE(o."deliveredDate"), EXTRACT(DOW FROM o."deliveredDate")
              ),
              location_capacity AS (
                SELECT "storageCapacity" as capacity
                FROM "Location" WHERE id = ${locationId}
              )
              SELECT 
                dd.date::text,
                dd.packages_delivered::integer,
                ROUND((dd.packages_delivered * 100.0 / lc.capacity), 2) as utilization,
                dd.day_of_week::integer
              FROM daily_data dd
              CROSS JOIN location_capacity lc
              ORDER BY dd.date
            `
          : await ctx.db.$queryRaw<
              Array<{
                date: string;
                packages_delivered: number;
                utilization: number;
                day_of_week: number;
              }>
            >`
              WITH daily_data AS (
                SELECT 
                  DATE(o."deliveredDate") as date,
                  EXTRACT(DOW FROM o."deliveredDate") as day_of_week,
                  o."shippedLocationId" as location_id,
                  COUNT(*) as packages_delivered
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."deliveredDate" IS NOT NULL
                GROUP BY DATE(o."deliveredDate"), EXTRACT(DOW FROM o."deliveredDate"), o."shippedLocationId"
              ),
              location_capacity AS (
                SELECT l.id as location_id, l."storageCapacity" as capacity
                FROM "Location" l
              )
              SELECT 
                dd.date::text,
                SUM(dd.packages_delivered)::integer as packages_delivered,
                ROUND(AVG(dd.packages_delivered * 100.0 / lc.capacity), 2) as utilization,
                dd.day_of_week::integer
              FROM daily_data dd
              JOIN location_capacity lc ON dd.location_id = lc.location_id
              GROUP BY dd.date, dd.day_of_week
              ORDER BY dd.date
            `;

        return {
          granularity: "daily" as const,
          dailyData: dailyPatterns.map((day) => ({
            date: day.date,
            packagesDelivered: day.packages_delivered,
            utilization: Number(day.utilization),
            dayOfWeek: day.day_of_week,
          })),
          insights: {
            averageDaily:
              Math.round(
                (dailyPatterns.reduce(
                  (sum, day) => sum + Number(day.utilization),
                  0,
                ) /
                  dailyPatterns.length) *
                  10,
              ) / 10,
            peakDaily: Math.max(
              ...dailyPatterns.map((day) => Number(day.utilization)),
            ),
            totalPackages: dailyPatterns.reduce(
              (sum, day) => sum + day.packages_delivered,
              0,
            ),
          },
        };
      } else {
        // Weekly aggregation
        const weeklyPatterns = locationId
          ? await ctx.db.$queryRaw<
              Array<{
                week_start: string;
                week_end: string;
                packages_delivered: number;
                avg_utilization: number;
                peak_utilization: number;
              }>
            >`
              WITH weekly_data AS (
                SELECT 
                  DATE_TRUNC('week', o."deliveredDate") as week_start,
                  DATE_TRUNC('week', o."deliveredDate") + INTERVAL '6 days' as week_end,
                  DATE(o."deliveredDate") as date,
                  COUNT(*) as daily_packages
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."deliveredDate" IS NOT NULL
                  AND o."shippedLocationId" = ${locationId}
                GROUP BY DATE_TRUNC('week', o."deliveredDate"), DATE(o."deliveredDate")
              ),
              location_capacity AS (
                SELECT "storageCapacity" as capacity
                FROM "Location" WHERE id = ${locationId}
              )
              SELECT 
                wd.week_start::text,
                wd.week_end::text,
                SUM(wd.daily_packages)::integer as packages_delivered,
                ROUND(AVG(wd.daily_packages * 100.0 / lc.capacity), 2) as avg_utilization,
                ROUND(MAX(wd.daily_packages * 100.0 / lc.capacity), 2) as peak_utilization
              FROM weekly_data wd
              CROSS JOIN location_capacity lc
              GROUP BY wd.week_start, wd.week_end
              ORDER BY wd.week_start
            `
          : await ctx.db.$queryRaw<
              Array<{
                week_start: string;
                week_end: string;
                packages_delivered: number;
                avg_utilization: number;
                peak_utilization: number;
              }>
            >`
              WITH weekly_data AS (
                SELECT 
                  DATE_TRUNC('week', o."deliveredDate") as week_start,
                  DATE_TRUNC('week', o."deliveredDate") + INTERVAL '6 days' as week_end,
                  DATE(o."deliveredDate") as date,
                  o."shippedLocationId" as location_id,
                  COUNT(*) as daily_packages
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."deliveredDate" IS NOT NULL
                GROUP BY DATE_TRUNC('week', o."deliveredDate"), DATE(o."deliveredDate"), o."shippedLocationId"
              ),
              location_capacity AS (
                SELECT l.id as location_id, l."storageCapacity" as capacity
                FROM "Location" l
              )
              SELECT 
                wd.week_start::text,
                wd.week_end::text,
                SUM(wd.daily_packages)::integer as packages_delivered,
                ROUND(AVG(wd.daily_packages * 100.0 / lc.capacity), 2) as avg_utilization,
                ROUND(MAX(wd.daily_packages * 100.0 / lc.capacity), 2) as peak_utilization
              FROM weekly_data wd
              JOIN location_capacity lc ON wd.location_id = lc.location_id
              GROUP BY wd.week_start, wd.week_end
              ORDER BY wd.week_start
            `;

        return {
          granularity: "weekly" as const,
          weeklyData: weeklyPatterns.map((week) => ({
            weekStart: week.week_start,
            weekEnd: week.week_end,
            packagesDelivered: week.packages_delivered,
            avgUtilization: Number(week.avg_utilization),
            peakUtilization: Number(week.peak_utilization),
          })),
          insights: {
            averageWeekly:
              Math.round(
                (weeklyPatterns.reduce(
                  (sum, week) => sum + Number(week.avg_utilization),
                  0,
                ) /
                  weeklyPatterns.length) *
                  10,
              ) / 10,
            peakWeekly: Math.max(
              ...weeklyPatterns.map((week) => Number(week.peak_utilization)),
            ),
            totalPackages: weeklyPatterns.reduce(
              (sum, week) => sum + week.packages_delivered,
              0,
            ),
          },
        };
      }
    }),

  // Export analytics data (CSV functionality)
  exportAnalyticsData: protectedCorporateProcedure
    .input(
      analyticsInputSchema.extend({
        format: z.enum(["csv"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { locationId, dateRange, format } = input;

      // TODO: Add Redis caching here for performance

      try {
        // Fetch all the analytics data
        const [
          utilizationData,
          pickupData,
          customerData,
          revenueData,
          processingData,
        ] = await Promise.all([
          // Get utilization metrics
          locationId
            ? ctx.db.$queryRaw<
                Array<{
                  location_name: string;
                  current_utilization: number;
                  avg_daily_utilization: number;
                  storage_capacity: number;
                  current_packages: number;
                }>
              >`
                SELECT 
                  l.name as location_name,
                  COALESCE(current_count.current_packages, 0) as current_packages,
                  l."storageCapacity" as storage_capacity,
                  ROUND((COALESCE(current_count.current_packages, 0) * 100.0 / l."storageCapacity"), 2) as current_utilization,
                  ROUND((AVG(COALESCE(daily_counts.package_count, 0)) * 100.0 / l."storageCapacity"), 2) as avg_daily_utilization
                FROM "Location" l
                LEFT JOIN (
                  SELECT 
                    "shippedLocationId",
                    COUNT(*) as current_packages
                  FROM "Order" 
                  WHERE "deliveredDate" IS NOT NULL 
                    AND "pickedUpAt" IS NULL
                    AND "shippedLocationId" = ${locationId}
                  GROUP BY "shippedLocationId"
                ) current_count ON l.id = current_count."shippedLocationId"
                LEFT JOIN (
                  SELECT 
                    "shippedLocationId",
                    DATE("deliveredDate") as date,
                    COUNT(*) as package_count
                  FROM "Order" 
                  WHERE "deliveredDate" >= ${dateRange.from}
                    AND "deliveredDate" <= ${dateRange.to}
                    AND "deliveredDate" IS NOT NULL
                    AND "shippedLocationId" = ${locationId}
                  GROUP BY "shippedLocationId", DATE("deliveredDate")
                ) daily_counts ON l.id = daily_counts."shippedLocationId"
                WHERE l.id = ${locationId}
                GROUP BY l.id, l.name, l."storageCapacity", current_count.current_packages
              `
            : ctx.db.$queryRaw<
                Array<{
                  location_name: string;
                  current_utilization: number;
                  avg_daily_utilization: number;
                  storage_capacity: number;
                  current_packages: number;
                }>
              >`
                SELECT 
                  l.name as location_name,
                  COALESCE(current_count.current_packages, 0) as current_packages,
                  l."storageCapacity" as storage_capacity,
                  ROUND((COALESCE(current_count.current_packages, 0) * 100.0 / l."storageCapacity"), 2) as current_utilization,
                  ROUND((AVG(COALESCE(daily_counts.package_count, 0)) * 100.0 / l."storageCapacity"), 2) as avg_daily_utilization
                FROM "Location" l
                LEFT JOIN (
                  SELECT 
                    "shippedLocationId",
                    COUNT(*) as current_packages
                  FROM "Order" 
                  WHERE "deliveredDate" IS NOT NULL 
                    AND "pickedUpAt" IS NULL
                  GROUP BY "shippedLocationId"
                ) current_count ON l.id = current_count."shippedLocationId"
                LEFT JOIN (
                  SELECT 
                    "shippedLocationId",
                    DATE("deliveredDate") as date,
                    COUNT(*) as package_count
                  FROM "Order" 
                  WHERE "deliveredDate" >= ${dateRange.from}
                    AND "deliveredDate" <= ${dateRange.to}
                    AND "deliveredDate" IS NOT NULL
                  GROUP BY "shippedLocationId", DATE("deliveredDate")
                ) daily_counts ON l.id = daily_counts."shippedLocationId"
                GROUP BY l.id, l.name, l."storageCapacity", current_count.current_packages
                ORDER BY l.name
              `,

          // Get pickup analytics
          locationId
            ? ctx.db.$queryRaw<
                Array<{
                  avg_pickup_hours: number;
                  same_day: number;
                  one_two_day: number;
                  three_five_day: number;
                  six_plus_day: number;
                }>
              >`
                SELECT 
                  AVG(EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 3600) as avg_pickup_hours,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 < 1 THEN 1 END) as same_day,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 > 5 THEN 1 END) as six_plus_day
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."pickedUpAt" IS NOT NULL
                  AND o."deliveredDate" IS NOT NULL
                  AND o."shippedLocationId" = ${locationId}
              `
            : ctx.db.$queryRaw<
                Array<{
                  avg_pickup_hours: number;
                  same_day: number;
                  one_two_day: number;
                  three_five_day: number;
                  six_plus_day: number;
                }>
              >`
                SELECT 
                  AVG(EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 3600) as avg_pickup_hours,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 < 1 THEN 1 END) as same_day,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 1 AND 2 THEN 1 END) as one_two_day,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 BETWEEN 3 AND 5 THEN 1 END) as three_five_day,
                  COUNT(CASE WHEN EXTRACT(EPOCH FROM (o."pickedUpAt"::timestamp - o."deliveredDate"::timestamp))::float / 86400 > 5 THEN 1 END) as six_plus_day
                FROM "Order" o
                WHERE o."deliveredDate" >= ${dateRange.from}
                  AND o."deliveredDate" <= ${dateRange.to}
                  AND o."pickedUpAt" IS NOT NULL
                  AND o."deliveredDate" IS NOT NULL
              `,

          // Get customer metrics
          locationId
            ? ctx.db.$queryRaw<
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
            : ctx.db.$queryRaw<
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
              `,

          // Get revenue metrics
          locationId
            ? ctx.db.$queryRaw<
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
            : ctx.db.$queryRaw<
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
              `,

          // Get processing time metrics
          locationId
            ? ctx.db.$queryRaw<
                Array<{
                  avg_processing_hours: number;
                }>
              >`
                SELECT 
                  AVG(EXTRACT(EPOCH FROM ("processedAt"::timestamp - "deliveredDate"::timestamp))::float / 3600) as avg_processing_hours
                FROM "Order"
                WHERE "deliveredDate" >= ${dateRange.from}
                  AND "deliveredDate" <= ${dateRange.to}
                  AND "processedAt" IS NOT NULL
                  AND "deliveredDate" IS NOT NULL
                  AND "shippedLocationId" = ${locationId}
              `
            : ctx.db.$queryRaw<
                Array<{
                  avg_processing_hours: number;
                }>
              >`
                SELECT 
                  AVG(EXTRACT(EPOCH FROM ("processedAt"::timestamp - "deliveredDate"::timestamp))::float / 3600) as avg_processing_hours
                FROM "Order"
                WHERE "deliveredDate" >= ${dateRange.from}
                  AND "deliveredDate" <= ${dateRange.to}
                  AND "processedAt" IS NOT NULL
                  AND "deliveredDate" IS NOT NULL
              `,
        ]);

        // Generate CSV content
        const csvData = [];

        // Add headers
        csvData.push([
          "Metric Category",
          "Metric Name",
          "Value",
          "Unit",
          "Location",
          "Date Range",
        ]);

        const dateRangeStr = `${dateRange.from.toISOString().split("T")[0]} to ${dateRange.to.toISOString().split("T")[0]}`;
        const locationStr = locationId
          ? utilizationData[0]?.location_name || "Unknown"
          : "All Locations";

        // Add utilization data
        utilizationData.forEach((location) => {
          csvData.push([
            "Utilization",
            "Current Utilization",
            location.current_utilization,
            "%",
            location.location_name,
            dateRangeStr,
          ]);
          csvData.push([
            "Utilization",
            "Average Daily Utilization",
            location.avg_daily_utilization,
            "%",
            location.location_name,
            dateRangeStr,
          ]);
          csvData.push([
            "Utilization",
            "Storage Capacity",
            location.storage_capacity,
            "packages",
            location.location_name,
            dateRangeStr,
          ]);
          csvData.push([
            "Utilization",
            "Current Packages",
            location.current_packages,
            "packages",
            location.location_name,
            dateRangeStr,
          ]);
        });

        // Add pickup data
        if (pickupData[0]) {
          csvData.push([
            "Pickup",
            "Average Pickup Time",
            pickupData[0].avg_pickup_hours || 0,
            "hours",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Pickup",
            "Same Day Pickups",
            pickupData[0].same_day || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Pickup",
            "1-2 Day Pickups",
            pickupData[0].one_two_day || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Pickup",
            "3-5 Day Pickups",
            pickupData[0].three_five_day || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Pickup",
            "6+ Day Pickups",
            pickupData[0].six_plus_day || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
        }

        // Add customer data
        if (customerData[0]) {
          csvData.push([
            "Customer",
            "Unique Customers",
            customerData[0].unique_customers || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Customer",
            "New Customers",
            customerData[0].new_customers || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Customer",
            "Returning Customers",
            customerData[0].returning_customers || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Customer",
            "Total Packages",
            customerData[0].total_packages || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
        }

        // Add revenue data
        if (revenueData[0]) {
          csvData.push([
            "Revenue",
            "Total Revenue",
            revenueData[0].total_revenue || 0,
            "USD",
            locationStr,
            dateRangeStr,
          ]);
          csvData.push([
            "Revenue",
            "Package Count",
            revenueData[0].package_count || 0,
            "count",
            locationStr,
            dateRangeStr,
          ]);
          const avgRevenue = revenueData[0].package_count
            ? Number(revenueData[0].total_revenue) /
              Number(revenueData[0].package_count)
            : 0;
          csvData.push([
            "Revenue",
            "Average Revenue per Package",
            avgRevenue,
            "USD",
            locationStr,
            dateRangeStr,
          ]);
        }

        // Add processing data
        if (processingData[0]) {
          csvData.push([
            "Processing",
            "Average Processing Time",
            processingData[0].avg_processing_hours || 0,
            "hours",
            locationStr,
            dateRangeStr,
          ]);
        }

        // Convert to CSV string
        const csvContent = csvData
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        return {
          success: true,
          message: `CSV export completed successfully with ${csvData.length - 1} data points`,
          downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
          filename: `eboxsecure-analytics-${locationStr.replace(/\s+/g, "-").toLowerCase()}-${dateRangeStr}.csv`,
        };
      } catch (error) {
        console.error("Export error:", error);
        return {
          success: false,
          message: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          downloadUrl: null,
        };
      }
    }),
});
