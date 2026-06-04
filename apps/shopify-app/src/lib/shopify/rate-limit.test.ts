import { beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "./rate-limit";
import type { RedisLike } from "./types";

let count: number;
let redis: RedisLike & { expire: ReturnType<typeof vi.fn> };

beforeEach(() => {
  count = 0;
  redis = {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    incr: vi.fn().mockImplementation(() => Promise.resolve(++count)),
    expire: vi.fn().mockResolvedValue(1),
  };
});

describe("rateLimit", () => {
  it("allows hits under the limit and sets the window TTL on the first hit", async () => {
    const first = await rateLimit(redis, "send-otp:a@b.com", { limit: 3, windowSeconds: 60 });
    expect(first).toEqual({ allowed: true, remaining: 2 });
    expect(redis.expire).toHaveBeenCalledWith("ratelimit:send-otp:a@b.com", 60);
  });

  it("blocks once the limit is exceeded", async () => {
    const opts = { limit: 2, windowSeconds: 60 };
    expect((await rateLimit(redis, "k", opts)).allowed).toBe(true); // 1
    expect((await rateLimit(redis, "k", opts)).allowed).toBe(true); // 2
    expect((await rateLimit(redis, "k", opts)).allowed).toBe(false); // 3
    // expire only set once, on the first hit of the window
    expect(redis.expire).toHaveBeenCalledTimes(1);
  });
});
