import { z } from "zod";

import { createTRPCRouter, protectedCorporateProcedure } from "../trpc";

export const carriersRouter = createTRPCRouter({
  getAllCarriers: protectedCorporateProcedure.query(async ({ ctx }) => {
    const carriers = await ctx.db.carrier.findMany({
      select: {
        id: true,
        name: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
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

    return carriers.map((carrier) => ({
      id: carrier.id,
      name: carrier.name,
      contactName: carrier.contactName,
      contactEmail: carrier.contactEmail,
      contactPhone: carrier.contactPhone,
      orderCount: carrier._count.orders,
    }));
  }),

  getCarrierDetails: protectedCorporateProcedure
    .input(z.object({ carrierId: z.number() }))
    .query(async ({ input, ctx }) => {
      const carrier = await ctx.db.carrier.findUnique({
        where: { id: input.carrierId },
        include: {
          orders: {
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              shippedLocation: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!carrier) {
        throw new Error("Carrier not found");
      }

      return carrier;
    }),

  getCarrierMetrics: protectedCorporateProcedure
    .input(z.object({ carrierId: z.number() }))
    .query(async ({ input, ctx }) => {
      const orders = await ctx.db.order.findMany({
        where: { carrierId: input.carrierId },
        select: {
          deliveredDate: true,
          createdAt: true,
        },
      });

      const totalOrders = orders.length;
      const deliveredOrders = orders.filter(
        (order) => order.deliveredDate !== null,
      );
      const ordersInTransit = orders.filter(
        (order) => order.deliveredDate === null,
      );

      // Calculate average delivery time for delivered orders
      let averageDeliveryTime = 0;
      if (deliveredOrders.length > 0) {
        const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
          const deliveryTime =
            order.deliveredDate!.getTime() - order.createdAt.getTime();
          return sum + deliveryTime;
        }, 0);

        // Convert from milliseconds to days
        averageDeliveryTime = Math.round(
          totalDeliveryTime / deliveredOrders.length / (1000 * 60 * 60 * 24),
        );
      }

      return {
        totalOrders,
        ordersDelivered: deliveredOrders.length,
        ordersInTransit: ordersInTransit.length,
        averageDeliveryTime, // in days
      };
    }),
});
