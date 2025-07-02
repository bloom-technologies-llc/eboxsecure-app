/**
 * Analytics Data Seeding Script
 *
 * This script generates realistic analytics data for EboxSecure dashboard testing.
 * It creates orders with realistic patterns that match the UI mock data expectations.
 *
 * Usage: npx tsx packages/db/seed-analytics.ts
 */

import { LocationType, PrismaClient, UserType } from "@prisma/client";

const db = new PrismaClient();

// Seeding configuration
const SEED_CONFIG = {
  // Time range for historical data (6 months back)
  START_DATE: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
  END_DATE: new Date(),

  // Number of orders to generate
  TOTAL_ORDERS: 5000,

  // Customer configuration
  CUSTOMERS_COUNT: 800,

  // Location configuration
  LOCATIONS: [
    {
      name: "Location A",
      storageCapacity: 500,
      address: "123 Main St, City A",
    },
    {
      name: "Location B",
      storageCapacity: 350,
      address: "456 Oak Ave, City B",
    },
    {
      name: "Location C",
      storageCapacity: 750,
      address: "789 Pine Rd, City C",
    },
    { name: "Location D", storageCapacity: 400, address: "321 Elm St, City D" },
    {
      name: "Location E",
      storageCapacity: 600,
      address: "654 Cedar Ln, City E",
    },
  ],
};

// Utility functions for realistic data generation
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// Generate realistic business hours delivery pattern
function getDeliveryDate(): Date {
  const baseDate = randomDate(SEED_CONFIG.START_DATE, SEED_CONFIG.END_DATE);
  const dayOfWeek = baseDate.getDay();

  // Less activity on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (Math.random() < 0.3) {
      // 30% chance of weekend delivery
      return baseDate;
    } else {
      // Move to weekday
      const daysToAdd = dayOfWeek === 0 ? 1 : 2; // Sunday -> Monday, Saturday -> Monday
      return addDays(baseDate, daysToAdd);
    }
  }

  // Business hours: 8 AM to 6 PM with peak around lunch and evening
  let hour: number;
  const rand = Math.random();
  if (rand < 0.2) {
    hour = randomBetween(8, 11); // Morning
  } else if (rand < 0.4) {
    hour = randomBetween(11, 14); // Lunch peak
  } else if (rand < 0.7) {
    hour = randomBetween(14, 17); // Afternoon
  } else {
    hour = randomBetween(17, 20); // Evening peak
  }

  const result = new Date(baseDate);
  result.setHours(Math.floor(hour), Math.floor(randomBetween(0, 60)), 0, 0);
  return result;
}

// Generate realistic pickup time based on delivered date
function getPickupDate(deliveredDate: Date): Date | null {
  const rand = Math.random();

  // 15% chance package is not yet picked up (current packages)
  if (rand < 0.15) {
    return null;
  }

  // Realistic pickup patterns:
  // - 40% same day (0-24 hours)
  // - 30% 1-2 days
  // - 20% 3-5 days
  // - 10% 6+ days

  let hoursToAdd: number;
  const pickupRand = Math.random();

  if (pickupRand < 0.4) {
    // Same day pickup (2-24 hours)
    hoursToAdd = randomBetween(2, 24);
  } else if (pickupRand < 0.7) {
    // 1-2 day pickup
    hoursToAdd = randomBetween(24, 48);
  } else if (pickupRand < 0.9) {
    // 3-5 day pickup
    hoursToAdd = randomBetween(72, 120);
  } else {
    // 6+ day pickup (up to 2 weeks)
    hoursToAdd = randomBetween(144, 336);
  }

  return addHours(deliveredDate, hoursToAdd);
}

// Generate realistic processing time (delivery to ready for pickup)
function getProcessedDate(deliveredDate: Date): Date {
  // Processing typically takes 0.5 - 4 hours with average around 2 hours
  const processingHours = randomBetween(0.5, 4);
  return addHours(deliveredDate, processingHours);
}

// Generate realistic order total
function generateOrderTotal(): number {
  // Order totals typically range from $5 to $200 with average around $25
  const rand = Math.random();
  if (rand < 0.6) {
    return Math.round(randomBetween(5, 50) * 100) / 100; // 60% small orders
  } else if (rand < 0.9) {
    return Math.round(randomBetween(50, 100) * 100) / 100; // 30% medium orders
  } else {
    return Math.round(randomBetween(100, 200) * 100) / 100; // 10% large orders
  }
}

async function createCustomers(): Promise<string[]> {
  console.log("Creating customer accounts...");

  const customerIds: string[] = [];

  for (let i = 0; i < SEED_CONFIG.CUSTOMERS_COUNT; i++) {
    const userId = `seed_customer_${i.toString().padStart(4, "0")}`;

    try {
      // Create user
      await db.user.create({
        data: {
          id: userId,
          userType: UserType.CUSTOMER,
          customerAccount: {
            create: {
              firstName: "seed",
              lastName: `customer_${i.toString().padStart(4, "0")}`,
              email: "seed@gmail.com",
            },
          },
        },
      });

      customerIds.push(userId);
    } catch (error) {
      // Skip if user already exists
      if ((error as any).code !== "P2002") {
        console.error(`Error creating customer ${userId}:`, error);
      }
    }
  }

  console.log(`Created ${customerIds.length} customer accounts`);
  return customerIds;
}

async function createLocations(): Promise<number[]> {
  console.log("Creating locations...");

  const locationIds: number[] = [];

  for (const locationData of SEED_CONFIG.LOCATIONS) {
    try {
      const location = await db.location.create({
        data: {
          name: locationData.name,
          address: locationData.address,
          storageCapacity: locationData.storageCapacity,
          locationType: LocationType.FRANCHISE,
        },
      });

      locationIds.push(location.id);
      console.log(`Created ${locationData.name} (ID: ${location.id})`);
    } catch (error) {
      // If location already exists, find it
      if ((error as any).code === "P2002") {
        const existingLocation = await db.location.findFirst({
          where: { name: locationData.name },
        });
        if (existingLocation) {
          locationIds.push(existingLocation.id);
          console.log(
            `Found existing ${locationData.name} (ID: ${existingLocation.id})`,
          );
        }
      } else {
        console.error(`Error creating location ${locationData.name}:`, error);
      }
    }
  }

  return locationIds;
}

async function createOrders(
  customerIds: string[],
  locationIds: number[],
): Promise<void> {
  console.log(`Creating ${SEED_CONFIG.TOTAL_ORDERS} orders...`);

  const orders: Array<{
    customerId: string;
    vendorOrderId: string;
    total: number;
    shippedLocationId: number;
    deliveredDate: Date;
    processedAt: Date;
    pickedUpAt: Date | null;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < SEED_CONFIG.TOTAL_ORDERS; i++) {
    const customerId =
      customerIds[Math.floor(Math.random() * customerIds.length)];
    const locationId =
      locationIds[Math.floor(Math.random() * locationIds.length)];
    const deliveredDate = getDeliveryDate();
    const processedAt = getProcessedDate(deliveredDate);
    const pickedUpAt = getPickupDate(deliveredDate);
    const total = generateOrderTotal();

    orders.push({
      customerId,
      vendorOrderId: `VENDOR_${Date.now()}_${i}`,
      total,
      shippedLocationId: locationId,
      deliveredDate,
      processedAt,
      pickedUpAt,
      createdAt: new Date(
        deliveredDate.getTime() - randomBetween(1, 24) * 60 * 60 * 1000,
      ), // Created 1-24 hours before delivery
    });

    // Batch insert every 100 orders for performance
    if (orders.length === 100 || i === SEED_CONFIG.TOTAL_ORDERS - 1) {
      try {
        await db.order.createMany({
          data: orders,
          skipDuplicates: true,
        });
        console.log(
          `Inserted ${orders.length} orders (${i + 1}/${SEED_CONFIG.TOTAL_ORDERS})`,
        );
        orders.length = 0; // Clear the batch
      } catch (error) {
        console.error("Error inserting orders batch:", error);
      }
    }
  }

  console.log("Finished creating orders");
}

async function createCorporateAccount(): Promise<void> {
  console.log("Creating corporate test account...");

  const corporateUserId = "corp_test_user";

  try {
    await db.user.create({
      data: {
        id: corporateUserId,
        userType: UserType.CORPORATE,
        corporateAccount: {
          create: {},
        },
      },
    });
    console.log("Created corporate test account (ID: corp_test_user)");
  } catch (error) {
    if ((error as any).code === "P2002") {
      console.log("Corporate test account already exists");
    } else {
      console.error("Error creating corporate account:", error);
    }
  }
}

async function generateAnalyticsReport(): Promise<void> {
  console.log("\n=== Analytics Data Summary ===");

  // Total orders
  const totalOrders = await db.order.count();
  console.log(`Total Orders: ${totalOrders}`);

  // Orders by location
  const ordersByLocation = await db.order.groupBy({
    by: ["shippedLocationId"],
    _count: {
      id: true,
    },
    orderBy: {
      shippedLocationId: "asc",
    },
  });

  console.log("\nOrders by Location:");
  for (const locationData of ordersByLocation) {
    const location = await db.location.findUnique({
      where: { id: locationData.shippedLocationId },
      select: { name: true, storageCapacity: true },
    });

    const currentPackages = await db.order.count({
      where: {
        shippedLocationId: locationData.shippedLocationId,
        deliveredDate: { not: null },
        pickedUpAt: null,
      },
    });

    const utilization = location
      ? (currentPackages / location.storageCapacity) * 100
      : 0;

    console.log(
      `  ${location?.name}: ${locationData._count.id} orders, ${currentPackages} current packages (${utilization.toFixed(1)}% utilization)`,
    );
  }

  // Recent orders (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = await db.order.count({
    where: {
      deliveredDate: {
        gte: thirtyDaysAgo,
      },
    },
  });

  console.log(`\nOrders in last 30 days: ${recentOrders}`);

  // Pickup statistics
  const totalDelivered = await db.order.count({
    where: { deliveredDate: { not: null } },
  });

  const totalPickedUp = await db.order.count({
    where: { pickedUpAt: { not: null } },
  });

  const pickupRate =
    totalDelivered > 0 ? (totalPickedUp / totalDelivered) * 100 : 0;
  console.log(
    `Pickup Rate: ${pickupRate.toFixed(1)}% (${totalPickedUp}/${totalDelivered})`,
  );

  // Revenue
  const totalRevenue = await db.order.aggregate({
    _sum: { total: true },
    where: { deliveredDate: { not: null } },
  });

  console.log(
    `Total Revenue: $${totalRevenue._sum.total?.toFixed(2) || "0.00"}`,
  );

  console.log("\n=== Seeding Complete ===");
  console.log("You can now test the analytics dashboard with realistic data!");
  console.log("Corporate test account: corp_test_user");
}

async function main(): Promise<void> {
  try {
    console.log("🌱 Starting analytics data seeding...");
    console.log(
      `Target: ${SEED_CONFIG.TOTAL_ORDERS} orders across ${SEED_CONFIG.LOCATIONS.length} locations`,
    );
    console.log(
      `Date range: ${SEED_CONFIG.START_DATE.toISOString().split("T")[0]} to ${SEED_CONFIG.END_DATE.toISOString().split("T")[0]}`,
    );
    console.log("");

    // Create corporate account for testing
    await createCorporateAccount();

    // Create customers
    const customerIds = await createCustomers();

    // Create locations (or get existing ones)
    const locationIds = await createLocations();

    if (customerIds.length === 0 || locationIds.length === 0) {
      throw new Error("Failed to create required customers or locations");
    }

    // Create orders with realistic patterns
    await createOrders(customerIds, locationIds);

    // Generate summary report
    await generateAnalyticsReport();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the seeding script
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

export { main as seedAnalyticsData };
