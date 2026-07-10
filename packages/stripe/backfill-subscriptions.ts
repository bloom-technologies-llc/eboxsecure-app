/**
 * One-time backfill for CustomerAccount.subscription
 *
 * Context: `CustomerAccount.subscription` is the authoritative column read by
 * the admin Customers table, but historically it was never written — every row
 * was stuck at the `BASIC` default. `syncCustomerData` now persists the correct
 * tier to this column as a side effect (see ./src/index.ts). This script
 * replays that sync for every existing customer that has a Stripe customer id,
 * bringing the column up to date.
 *
 * For each CustomerAccount with a non-null `stripeCustomerId` we call
 * `syncCustomerData(stripeCustomerId)`, which:
 *   - refreshes the Redis KV cache, and
 *   - writes the resolved tier (or BASIC when there is no subscription) to the
 *     DB via `updateMany`.
 *
 * Customers WITHOUT a `stripeCustomerId` are intentionally left as-is: they have
 * never had a Stripe subscription and are correctly BASIC.
 *
 * The script is idempotent and safe to re-run: it only ever re-derives the
 * current tier from Stripe and overwrites the column with the same value.
 *
 * Required env (loaded from ../../.env by the package script):
 *   - STRIPE_SECRET_KEY
 *   - DATABASE_URL
 *   - UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (Redis/KV)
 *
 * Run:
 *   pnpm -F @ebox/stripe backfill-subscriptions
 */
import { db } from "@ebox/db";

import { syncCustomerData } from "./src/index";

async function main() {
  console.log("[backfill-subscriptions] Starting subscription tier backfill…");

  const customers = await db.customerAccount.findMany({
    where: { stripeCustomerId: { not: null } },
    select: { id: true, stripeCustomerId: true },
  });

  console.log(
    `[backfill-subscriptions] Found ${customers.length} customer(s) with a Stripe customer id.`,
  );

  let succeeded = 0;
  let failed = 0;
  const failures: { id: string; stripeCustomerId: string; error: string }[] =
    [];

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i]!;
    // Guaranteed non-null by the `where` clause above, but narrow for TS.
    const stripeCustomerId = customer.stripeCustomerId!;
    const progress = `(${i + 1}/${customers.length})`;

    try {
      const subData = await syncCustomerData(stripeCustomerId);
      succeeded++;
      console.log(
        `[backfill-subscriptions] ${progress} Synced customer ${customer.id} (${stripeCustomerId}) — status: ${subData.status}`,
      );
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id: customer.id, stripeCustomerId, error: message });
      console.error(
        `[backfill-subscriptions] ${progress} FAILED for customer ${customer.id} (${stripeCustomerId}): ${message}`,
      );
    }
  }

  console.log("\n[backfill-subscriptions] Done.");
  console.log(
    `[backfill-subscriptions] Summary: ${succeeded} succeeded, ${failed} failed, ${customers.length} total.`,
  );

  if (failures.length > 0) {
    console.log(
      "[backfill-subscriptions] The following customers failed to sync (re-running is safe):",
    );
    for (const failure of failures) {
      console.log(
        `  - ${failure.id} (${failure.stripeCustomerId}): ${failure.error}`,
      );
    }
  }
}

main()
  .catch((error) => {
    console.error("[backfill-subscriptions] Unhandled error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
