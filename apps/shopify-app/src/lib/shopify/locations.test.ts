import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { listLocations } from "./locations";

const db = mockDeep<PrismaClient>();

beforeEach(() => mockReset(db));

describe("listLocations", () => {
  it("shapes locations for the picker (slug label, address fallback, default country)", async () => {
    db.location.findMany.mockResolvedValue([
      {
        id: 7,
        name: "Downtown Hub",
        address: "1 Main St",
        address1: null,
        address2: null,
        city: "Austin",
        state: "TX",
        zip: "78701",
        countryCode: null,
      },
    ] as never);

    const result = await listLocations({ db });

    expect(result).toEqual([
      {
        id: 7,
        name: "Downtown Hub",
        label: "downtown-hub",
        value: {
          address1: "1 Main St",
          address2: undefined,
          city: "Austin",
          zip: "78701",
          provinceCode: "TX",
          countryCode: "US",
        },
      },
    ]);
  });

  it("prefers address1 over the legacy address field and keeps an explicit countryCode", async () => {
    db.location.findMany.mockResolvedValue([
      {
        id: 3,
        name: "North Depot",
        address: "legacy",
        address1: "500 North Rd",
        address2: "Unit 2",
        city: "Toronto",
        state: "ON",
        zip: "M5V",
        countryCode: "CA",
      },
    ] as never);

    const result = await listLocations({ db });
    const loc = result[0]!;

    expect(loc.value.address1).toBe("500 North Rd");
    expect(loc.value.address2).toBe("Unit 2");
    expect(loc.value.countryCode).toBe("CA");
    expect(loc.label).toBe("north-depot");
  });

  it("returns an empty array when there are no locations", async () => {
    db.location.findMany.mockResolvedValue([] as never);
    expect(await listLocations({ db })).toEqual([]);
  });
});
