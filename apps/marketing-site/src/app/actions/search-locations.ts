"use server";

import { db } from "@ebox/db";

export interface LocationSearchResult {
  id: number;
  name: string;
  address: string;
}

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const locations = await db.location.findMany({
      where: {
        address: {
          contains: query.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
      take: 10, // Limit results to 10
    });

    return locations;
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
}
