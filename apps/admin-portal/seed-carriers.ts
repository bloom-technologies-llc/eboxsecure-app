/**
 * Carriers Seeding Script
 *
 * This script creates carrier data and randomly assigns existing orders to carriers.
 * It creates 4 carriers (USPS, UPS, FedEx, DHL) and distributes orders among them.
 *
 * Usage: npx tsx apps/admin-portal/seed-carriers.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Carrier seed data
const CARRIERS_DATA = [
  {
    name: "USPS",
    contactName: "John Smith",
    contactEmail: "john.smith@usps.com",
    contactPhone: "(555) 123-4567",
  },
  {
    name: "UPS",
    contactName: "Sarah Johnson",
    contactEmail: "sarah.johnson@ups.com",
    contactPhone: "(555) 234-5678",
  },
  {
    name: "FedEx",
    contactName: "Mike Wilson",
    contactEmail: "mike.wilson@fedex.com",
    contactPhone: "(555) 345-6789",
  },
  {
    name: "DHL",
    contactName: "Lisa Brown",
    contactEmail: "lisa.brown@dhl.com",
    contactPhone: "(555) 456-7890",
  },
];

// Target number of orders per carrier
const ORDERS_PER_CARRIER = 20;

async function createCarriers(): Promise<number[]> {
  console.log("Creating carriers...");

  const carrierIds: number[] = [];

  for (const carrierData of CARRIERS_DATA) {
    try {
      const carrier = await db.carrier.create({
        data: carrierData,
      });
      carrierIds.push(carrier.id);
      console.log(`Created carrier: ${carrierData.name} (ID: ${carrier.id})`);
    } catch (error) {
      console.error(`Error creating carrier ${carrierData.name}:`, error);
    }
  }

  console.log(`Created ${carrierIds.length} carriers`);
  return carrierIds;
}

async function assignOrdersToCarriers(carrierIds: number[]): Promise<void> {
  console.log("Assigning orders to carriers...");

  // Get all orders without carriers
  const availableOrders = await db.order.findMany({
    where: {
      carrierId: null,
    },
    select: {
      id: true,
    },
  });

  console.log(`Found ${availableOrders.length} orders without carriers`);

  if (availableOrders.length === 0) {
    console.log("No orders available to assign to carriers");
    return;
  }

  // Calculate how many orders to assign to each carrier
  const totalOrdersToAssign = Math.min(
    availableOrders.length,
    carrierIds.length * ORDERS_PER_CARRIER,
  );

  // Shuffle the available orders for random distribution
  const shuffledOrders = [...availableOrders].sort(() => Math.random() - 0.5);

  let assignedCount = 0;
  const ordersPerCarrier = Math.floor(totalOrdersToAssign / carrierIds.length);

  for (let i = 0; i < carrierIds.length; i++) {
    const carrierId = carrierIds[i];
    const startIndex = i * ordersPerCarrier;
    const endIndex =
      i === carrierIds.length - 1
        ? totalOrdersToAssign // Give remaining orders to last carrier
        : startIndex + ordersPerCarrier;

    const ordersToAssign = shuffledOrders.slice(startIndex, endIndex);

    if (ordersToAssign.length > 0) {
      const orderIds = ordersToAssign.map((order) => order.id);

      await db.order.updateMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        data: {
          carrierId: carrierId,
        },
      });

      assignedCount += ordersToAssign.length;
      console.log(
        `Assigned ${ordersToAssign.length} orders to carrier ID ${carrierId}`,
      );
    }
  }

  console.log(`Total orders assigned: ${assignedCount}`);
}

async function generateCarrierReport(): Promise<void> {
  console.log("\n=== Carrier Assignment Report ===");

  const carriers = await db.carrier.findMany({
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  for (const carrier of carriers) {
    console.log(
      `${carrier.name}: ${carrier._count.orders} orders | Contact: ${carrier.contactName} (${carrier.contactEmail})`,
    );
  }

  const totalOrdersWithCarriers = carriers.reduce(
    (sum, carrier) => sum + carrier._count.orders,
    0,
  );

  const totalOrders = await db.order.count();
  const unassignedOrders = totalOrders - totalOrdersWithCarriers;

  console.log(`\nTotal orders: ${totalOrders}`);
  console.log(`Orders with carriers: ${totalOrdersWithCarriers}`);
  console.log(`Orders without carriers: ${unassignedOrders}`);
}

async function main(): Promise<void> {
  try {
    console.log("Starting carrier seeding process...\n");

    // Create carriers
    const carrierIds = await createCarriers();

    if (carrierIds.length === 0) {
      console.log("No carriers were created. Exiting.");
      return;
    }

    // Assign orders to carriers
    await assignOrdersToCarriers(carrierIds);

    // Generate report
    await generateCarrierReport();

    console.log("\nCarrier seeding completed successfully!");
  } catch (error) {
    console.error("Error during carrier seeding:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the seeding script
main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

export { main as seedCarriersData };
