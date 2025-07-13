import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";
import {
  canUserAddMoreFavorites,
  getSubscriptionLimits,
} from "../utils/subscription-utils";

export const favoritesRouter = createTRPCRouter({
  // Get all user's favorite locations
  getFavorites: protectedCustomerProcedure.query(async ({ ctx }) => {
    return ctx.db.userFavoriteLocation.findMany({
      where: { userId: ctx.session.userId },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            storageCapacity: true,
            locationType: true,
          },
        },
      },
      orderBy: [
        { isPrimary: "desc" }, // Primary first
        { createdAt: "asc" }, // Then by creation date
      ],
    });
  }),

  // Add location to favorites
  addFavorite: protectedCustomerProcedure
    .input(z.object({ locationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if location exists
      const location = await ctx.db.location.findUnique({
        where: { id: input.locationId },
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      // Check if already favorited
      const existing = await ctx.db.userFavoriteLocation.findUnique({
        where: {
          userId_locationId: {
            userId: ctx.session.userId,
            locationId: input.locationId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Location already in favorites",
        });
      }

      // Get current favorites count
      const userFavoritesCount = await ctx.db.userFavoriteLocation.count({
        where: { userId: ctx.session.userId },
      });

      // Check subscription limits
      const { canAdd, limit } =
        await canUserAddMoreFavorites(userFavoritesCount);

      if (!canAdd) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            limit === -1
              ? "Unable to add more favorites at this time"
              : `You have reached the maximum number of favorite locations (${limit}) for your subscription plan. Please upgrade to add more favorites.`,
        });
      }

      // Check if this will be the user's first favorite (make it primary)
      const isPrimary = userFavoritesCount === 0;

      return ctx.db.userFavoriteLocation.create({
        data: {
          userId: ctx.session.userId,
          locationId: input.locationId,
          isPrimary,
        },
        include: {
          location: true,
        },
      });
    }),

  // Remove from favorites
  removeFavorite: protectedCustomerProcedure
    .input(z.object({ locationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const favorite = await ctx.db.userFavoriteLocation.findUnique({
        where: {
          userId_locationId: {
            userId: ctx.session.userId,
            locationId: input.locationId,
          },
        },
      });

      if (!favorite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Favorite not found",
        });
      }

      // If removing primary location, make the next oldest favorite primary
      if (favorite.isPrimary) {
        const nextFavorite = await ctx.db.userFavoriteLocation.findFirst({
          where: {
            userId: ctx.session.userId,
            id: { not: favorite.id },
          },
          orderBy: { createdAt: "asc" },
        });

        if (nextFavorite) {
          await ctx.db.userFavoriteLocation.update({
            where: { id: nextFavorite.id },
            data: { isPrimary: true },
          });
        }
      }

      await ctx.db.userFavoriteLocation.delete({
        where: { id: favorite.id },
      });

      return { success: true };
    }),

  // Set primary location
  setPrimary: protectedCustomerProcedure
    .input(z.object({ locationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Remove primary flag from all user's favorites
      await ctx.db.userFavoriteLocation.updateMany({
        where: { userId: ctx.session.userId },
        data: { isPrimary: false },
      });

      // Set new primary
      const updated = await ctx.db.userFavoriteLocation.update({
        where: {
          userId_locationId: {
            userId: ctx.session.userId,
            locationId: input.locationId,
          },
        },
        data: { isPrimary: true },
      });

      return updated;
    }),

  // Search locations (similar to marketing site)
  searchLocations: protectedCustomerProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ ctx, input }) => {
      const locations = await ctx.db.location.findMany({
        where: {
          OR: [
            {
              name: {
                contains: input.query,
                mode: "insensitive",
              },
            },
            {
              address: {
                contains: input.query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          address: true,
          storageCapacity: true,
          locationType: true,
        },
      });

      // Include favorite status for each location
      const userFavorites = await ctx.db.userFavoriteLocation.findMany({
        where: {
          userId: ctx.session.userId,
          locationId: { in: locations.map((l) => l.id) },
        },
        select: { locationId: true },
      });

      const favoriteLocationIds = new Set(
        userFavorites.map((f) => f.locationId),
      );

      return locations.map((location) => ({
        ...location,
        isFavorited: favoriteLocationIds.has(location.id),
      }));
    }),

  // Get single location details
  getLocationDetails: protectedCustomerProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.db.location.findUnique({
        where: { id: input.locationId },
        include: {
          orders: {
            where: { customerId: ctx.session.userId },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              vendorOrderId: true,
              total: true,
              deliveredDate: true,
              pickedUpAt: true,
            },
          },
        },
      });

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      const favorite = await ctx.db.userFavoriteLocation.findUnique({
        where: {
          userId_locationId: {
            userId: ctx.session.userId,
            locationId: input.locationId,
          },
        },
      });

      return {
        ...location,
        isFavorited: !!favorite,
        isPrimary: favorite?.isPrimary || false,
      };
    }),

  // Get user's favorites count and subscription limits
  getFavoritesLimits: protectedCustomerProcedure.query(async ({ ctx }) => {
    const [favoritesCount, subscriptionLimits] = await Promise.all([
      ctx.db.userFavoriteLocation.count({
        where: { userId: ctx.session.userId },
      }),
      getSubscriptionLimits(),
    ]);

    const { canAdd, limit, remaining } = await canUserAddMoreFavorites(
      favoritesCount,
      subscriptionLimits.subscriptionTier,
    );

    return {
      current: favoritesCount,
      limit,
      remaining,
      canAdd,
      subscriptionTier: subscriptionLimits.subscriptionTier,
      isUnlimited: subscriptionLimits.isUnlimited,
    };
  }),
});
