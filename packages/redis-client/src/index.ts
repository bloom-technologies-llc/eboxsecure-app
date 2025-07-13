import { Redis } from "@upstash/redis";

// This ensures a single client instance is created and reused.
const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof Redis.fromEnv> | undefined;
};

// Create a new client if one doesn't exist.
// In development, this prevents hot-reloading from creating multiple connections.
export const kv = globalForRedis.redis ?? Redis.fromEnv();

// In a non-production environment, attach the client to the global object.
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = kv;
}
