import type { Page } from "@playwright/test";

import { ADMIN_URL } from "./env";

/** Calls an admin tRPC mutation with the signed-in browser session (same call the scanner app makes). */
export async function adminMutation(page: Page, path: string, input: unknown) {
  if (!page.url().startsWith(ADMIN_URL)) await page.goto(ADMIN_URL);
  return page.evaluate(
    async ({ path, input }) => {
      const res = await fetch(`/api/trpc/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ json: input }),
      });
      const body = await res.json();
      return { httpStatus: res.status, data: body?.result?.data?.json ?? null, error: body?.error?.json?.message ?? null };
    },
    { path, input },
  );
}

export const FLAGSHIP_ADDRESS = "1964 Rhettsbury St, Carmel, IN 46032, USA";

export function scanInput(o: { name: string; virtualAddress?: string; tracking: string; address?: string }) {
  return {
    recipientName: o.name,
    formattedAddress: o.address ?? FLAGSHIP_ADDRESS,
    rawDeliveryJson: JSON.stringify({ source: "qa-e2e", tracking: o.tracking }),
    trackingNumber: o.tracking,
    ...(o.virtualAddress ? { virtualAddress: o.virtualAddress } : {}),
  };
}

/** Opens the "Scan pickup" dialog and submits a pickup code. */
export async function submitPickupCode(page: Page, code: string) {
  await page.getByRole("button", { name: "Scan pickup" }).click();
  await page.locator("#qr-input").fill(code);
  await page.getByRole("button", { name: "Scan QR Code" }).click();
}
