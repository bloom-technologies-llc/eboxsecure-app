import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

/** Direct database access for assertions and for the one documented data setup step (backdating a delivery). */
export function db() {
  if (!process.env.DATABASE_URL) {
    const env = readFileSync("../.env", "utf8");
    const m = env.match(/^DATABASE_URL=["']?([^"'\n]+)/m);
    if (!m) throw new Error("DATABASE_URL not found in ../.env");
    process.env.DATABASE_URL = m[1];
  }
  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("@prisma/client");
  return new PrismaClient();
}
