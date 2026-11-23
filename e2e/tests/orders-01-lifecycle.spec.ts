import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { adminMutation, scanInput, submitPickupCode } from "../lib/admin";
import { db } from "../lib/db";
import { ADMIN_URL, CLIENT_URL } from "../lib/env";
import { shot } from "../lib/evidence";

const identityA = JSON.parse(readFileSync(".auth/customer-a.identity.json", "utf8"));
const identityB = JSON.parse(readFileSync(".auth/customer-b.identity.json", "utf8"));
const STATE = ".auth/orders-state.json";
const state = (): Record<string, any> => (existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {});
const save = (patch: Record<string, any>) => writeFileSync(STATE, JSON.stringify({ ...state(), ...patch }, null, 2));
const tracking = (n: number) => `1ZQA${Date.now().toString(36).toUpperCase()}${n}`;

async function customer(email: string) {
  const prisma = db();
  const c = await prisma.customerAccount.findFirstOrThrow({ where: { email } });
  await prisma.$disconnect();
  return c;
}

/** Opens the order's QR dialog and returns the pickup code the QR encodes. */
async function qrCodeFor(page: Page, orderId: number) {
  await page.goto(`${CLIENT_URL}/?order=${orderId}`);
  const card = page.locator(".ring-primary");
  await expect(card).toBeVisible();
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("auth.getAuthorizedPickupToken") && r.ok()),
    card.getByRole("button", { name: "View QR Code" }).click(),
  ]);
  // The response is a tRPC stream; the pickup code is the encrypted token inside it.
  const token = (await res.text()).match(/eyJ[\w-]+\.[\w-]*\.[\w-]+\.[\w-]+\.[\w-]+/)?.[0];
  if (!token) throw new Error("pickup token not found in response");
  await expect(page.getByRole("heading", { name: "Order QR Code" })).toBeVisible();
  await expect(page.locator('[role="dialog"] canvas')).toBeVisible();
  return token;
}

test.describe.configure({ mode: "serial" });

test.describe("scan-in (associate, Flagship)", () => {
  test.use({ storageState: ".auth/admin-associateA.json" });

  test("SCN-01 package scanned in for a subscribed customer creates an order", async ({ page }, testInfo) => {
    const a = await customer(identityA.email);
    const t1 = tracking(1);
    const res = await adminMutation(page, "scanner.processPackage", scanInput({ name: `${a.firstName} ${a.lastName}`, virtualAddress: a.virtualAddress!, tracking: t1 }));
    expect(res.error).toBeNull();
    expect(res.data.status).toBe("success");
    const order1 = Number(res.data.data.orderId);
    save({ order1, t1 });
    await page.goto(`${ADMIN_URL}/orders`);
    await page.getByPlaceholder(/search/i).first().fill(t1);
    await expect(page.getByText(t1).first()).toBeVisible();
    await shot(page, testInfo, "new order listed in admin orders");
  });

  test("SCN-02 scanning the same tracking number twice is rejected", async ({ page }) => {
    const a = await customer(identityA.email);
    const res = await adminMutation(page, "scanner.processPackage", scanInput({ name: `${a.firstName} ${a.lastName}`, virtualAddress: a.virtualAddress!, tracking: state().t1 }));
    expect(res.data).toEqual({ status: "error", reason: "order_already_processed" });
  });

  test("SCN-03 label name that does not match the virtual address is rejected", async ({ page }) => {
    const a = await customer(identityA.email);
    const res = await adminMutation(page, "scanner.processPackage", scanInput({ name: "Jordan Nobody", virtualAddress: a.virtualAddress!, tracking: tracking(9) }));
    expect(res.data).toEqual({ status: "error", reason: "customer_not_found" });
  });

  test("SCN-04 package addressed to a different address than this location is rejected", async ({ page }) => {
    const a = await customer(identityA.email);
    const res = await adminMutation(page, "scanner.processPackage", scanInput({ name: `${a.firstName} ${a.lastName}`, virtualAddress: a.virtualAddress!, tracking: tracking(8), address: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA" }));
    expect(res.data).toBeNull();
    expect(res.error).toContain("Recipient address does not match location address");
  });

  test("SCN-05 unknown virtual address is rejected", async ({ page }) => {
    const a = await customer(identityA.email);
    const res = await adminMutation(page, "scanner.processPackage", scanInput({ name: `${a.firstName} ${a.lastName}`, virtualAddress: "CUST-000000", tracking: tracking(7) }));
    expect(res.data).toEqual({ status: "error", reason: "customer_not_found" });
  });
});

test.describe("customer A sees the delivered order", () => {
  test.use({ storageState: ".auth/customer-a.json" });

  test("ORD-01 delivered order appears with notification and QR code", async ({ page }, testInfo) => {
    const { order1 } = state();
    await page.goto(CLIENT_URL);
    await expect(page.getByText("Ready for pickup").first()).toBeVisible();
    await shot(page, testInfo, "active orders shows ready for pickup");
    await page.locator("button:has(svg.lucide-bell)").click();
    const note = page.getByText(/Your package has been delivered to/).first();
    await expect(note).toBeVisible();
    await shot(page, testInfo, "delivery notification");
    await note.click();
    await expect(page).toHaveURL(new RegExp(`order=${order1}`));
    await expect(page.locator(".ring-primary")).toBeVisible();
    await shot(page, testInfo, "notification opens the highlighted order");
    const token = await qrCodeFor(page, order1);
    save({ token1: token });
    await shot(page, testInfo, "pickup QR code");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("heading", { name: "Order QR Code" })).toBeHidden();
  });
});

test.describe("pickup desk: wrong location", () => {
  test.use({ storageState: ".auth/admin-associateB.json" });

  test("PICK-01 associate at another location cannot release the package", async ({ page }, testInfo) => {
    await page.goto(ADMIN_URL);
    await submitPickupCode(page, state().token1);
    await expect(page.getByText("This order is held at a different location.").first()).toBeVisible();
    await shot(page, testInfo, "other location blocked");
  });
});

test.describe("pickup desk: Flagship", () => {
  test.use({ storageState: ".auth/admin-associateA.json" });

  test("PICK-02 invalid pickup code is rejected", async ({ page }, testInfo) => {
    await page.goto(ADMIN_URL);
    await submitPickupCode(page, "not-a-real-code-12345");
    await expect(page.getByText("Invalid or corrupted QR code. Please try again.").first()).toBeVisible();
    await shot(page, testInfo, "invalid code rejected");
  });

  test("PICK-03 customer pickup: photo and name shown, order released", async ({ page }, testInfo) => {
    const { order1, token1 } = state();
    const a = await customer(identityA.email);
    await page.goto(ADMIN_URL);
    await submitPickupCode(page, token1);
    await expect(page.getByText(`${a.firstName} ${a.lastName}`).first()).toBeVisible();
    await expect(page.getByRole("img", { name: `${a.firstName} ${a.lastName}` })).toBeVisible();
    await expect(page.getByText("Authorized Trusted Contact")).toBeHidden();
    await page.waitForLoadState("networkidle").catch(() => {});
    await shot(page, testInfo, "customer photo and name for verification");
    await page.getByRole("button", { name: "Picked up by customer" }).click();
    await expect(page.getByText("Pickup Successful!")).toBeVisible();
    await expect(page.getByText(String(order1)).first()).toBeVisible();
    await shot(page, testInfo, "pickup successful");
  });

  test("PICK-04 the same pickup code cannot be used twice", async ({ page }, testInfo) => {
    await page.goto(ADMIN_URL);
    await submitPickupCode(page, state().token1);
    await expect(page.getByText("This order has already been picked up.").first()).toBeVisible();
    await shot(page, testInfo, "reused code rejected");
  });

  test("SCN-06 second and third packages scanned in for sharing and late-fee cases", async ({ page }) => {
    const a = await customer(identityA.email);
    const out: Record<string, any> = {};
    for (const n of [2, 3]) {
      const t = tracking(n);
      const res = await adminMutation(page, "scanner.processPackage", scanInput({ name: `${a.firstName} ${a.lastName}`, virtualAddress: a.virtualAddress!, tracking: t }));
      expect(res.data?.status).toBe("success");
      out[`order${n}`] = Number(res.data.data.orderId);
      out[`t${n}`] = t;
    }
    save(out);
  });
});

test.describe("customer A after pickup, and sharing", () => {
  test.use({ storageState: ".auth/customer-a.json" });

  test("ORD-02 picked-up order moves to the Picked up tab with a notification", async ({ page }, testInfo) => {
    const { order1 } = state();
    await page.goto(CLIENT_URL);
    await page.getByRole("tab", { name: "Picked up orders" }).click();
    await expect(page.getByRole("button", { name: "Picked Up" }).first()).toBeDisabled();
    await shot(page, testInfo, "order under picked up orders");
    await page.locator("button:has(svg.lucide-bell)").click();
    await expect(page.getByText(`Your package (Order #${order1}) has been picked up.`).first()).toBeVisible();
    await shot(page, testInfo, "pickup notification");
  });

  test("SHARE-01 customer shares an order with a trusted contact", async ({ page }, testInfo) => {
    const { order2, order3 } = state();
    const b = await customer(identityB.email);
    for (const id of [order2, order3]) {
      await page.goto(`${CLIENT_URL}/?order=${id}`);
      await page.locator(".ring-primary").getByRole("button", { name: "Share Order" }).click();
      await expect(page.getByText("Select trusted contacts who can pick up this order on your behalf.")).toBeVisible();
      await page.getByRole("checkbox").first().click();
      await expect(page.getByText(`Shared order with ${b.firstName} ${b.lastName}`).first()).toBeVisible();
      await expect(page.getByText("1 contact can pick up this order")).toBeVisible();
      if (id === order2) await shot(page, testInfo, "order shared with trusted contact");
      await page.getByRole("button", { name: "Close" }).first().click();
    }
    // Revoke on order 3, to prove access can be withdrawn.
    await page.goto(`${CLIENT_URL}/?order=${order3}`);
    await page.locator(".ring-primary").getByRole("button", { name: "Share Order" }).click();
    await page.getByRole("checkbox").first().click();
    await expect(page.getByText(`Revoked access from ${b.firstName} ${b.lastName}`).first()).toBeVisible();
    await expect(page.getByText("0 contacts can pick up this order")).toBeVisible();
    await shot(page, testInfo, "access revoked on second order");
  });
});

test.describe("trusted contact B", () => {
  test.use({ storageState: ".auth/customer-b.json" });

  test("SHARE-02 trusted contact sees only the shared order and gets its QR code", async ({ page }, testInfo) => {
    const { order2, order3 } = state();
    await page.goto(CLIENT_URL);
    await expect(page.getByText("Shared", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "View QR Code" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Share Order" })).toHaveCount(0);
    await shot(page, testInfo, "shared order visible to trusted contact");
    // Data setup: backdate delivery of the shared order so it is past the Basic plan's 2-day hold.
    const prisma = db();
    await prisma.order.update({ where: { id: order2 }, data: { deliveredDate: new Date(Date.now() - 4.5 * 24 * 3600 * 1000) } });
    await prisma.$disconnect();
    const token = await qrCodeFor(page, order2);
    save({ token2: token, order3 });
    await shot(page, testInfo, "trusted contact QR code");
  });
});

test.describe("pickup desk: trusted contact and late fee", () => {
  test.use({ storageState: ".auth/admin-associateA.json" });

  test("PICK-05 trusted contact pickup shows the contact's photo; late fee goes to the owner", async ({ page }, testInfo) => {
    const { order2, token2 } = state();
    const a = await customer(identityA.email);
    const b = await customer(identityB.email);
    await page.goto(ADMIN_URL);
    await submitPickupCode(page, token2);
    await expect(page.getByText("Authorized Trusted Contact")).toBeVisible();
    await expect(page.getByRole("img", { name: `${b.firstName} ${b.lastName}` })).toBeVisible();
    await page.waitForLoadState("networkidle").catch(() => {});
    await shot(page, testInfo, "trusted contact verified at desk");
    await page.getByRole("button", { name: "Picked up by customer" }).click();
    await expect(page.getByText("Pickup Successful!")).toBeVisible();
    await shot(page, testInfo, "trusted contact pickup successful");

    const prisma = db();
    const order = await prisma.order.findUniqueOrThrow({ where: { id: order2 } });
    const fees = await prisma.meterEvent.findMany({ where: { orderId: order2, eventType: "OVERDUE_PACKAGE_HOLDING" } });
    const notes = await prisma.notification.findMany({ where: { orderId: order2 }, orderBy: { createdAt: "asc" } });
    await prisma.$disconnect();
    expect(order.pickedUpById).toBe(b.id);
    expect(fees).toHaveLength(1);
    expect(fees[0].customerId).toBe(a.id);
    expect(fees[0].value).toBe(3);
    testInfo.annotations.push({ type: "db", description: JSON.stringify({ fees, notes: notes.map((n: any) => [n.userId === a.id ? "owner" : "other", n.type, n.message]) }) });
    console.log("FEE:", JSON.stringify(fees), JSON.stringify(notes.map((n: any) => [n.userId === a.id ? "owner" : "other", n.type, n.message])));
  });
});

test.describe("owner sees late fee", () => {
  test.use({ storageState: ".auth/customer-a.json" });

  test("FEE-01 owner is notified of the overdue holding fee", async ({ page }, testInfo) => {
    const { order2 } = state();
    await page.goto(CLIENT_URL);
    await page.locator("button:has(svg.lucide-bell)").click();
    await expect(page.getByText(`Your package (Order #${order2}) was overdue by 3 day(s). An overdue holding fee has been applied.`).first()).toBeVisible();
    await shot(page, testInfo, "overdue fee notification to owner");
    await page.keyboard.press("Escape");
    await page.goto(`${CLIENT_URL}/settings/usage`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await shot(page, testInfo, "usage page after three packages and a late fee");
  });
});
