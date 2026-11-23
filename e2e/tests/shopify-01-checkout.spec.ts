import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { db } from "../lib/db";
import { CLIENT_URL } from "../lib/env";
import { shot } from "../lib/evidence";

const STORE = "https://eboxsecure-dev-plus.myshopify.com";
const identityA = JSON.parse(readFileSync(".auth/customer-a.identity.json", "utf8"));

/** Reads the one-time code the checkout sign-in just issued (it is emailed to the customer; test addresses do not deliver). */
async function readOtp(email: string) {
  const env = readFileSync("../.env", "utf8");
  const get = (k: string) => env.match(new RegExp(`^${k}=["']?([^"'\\n]+)`, "m"))?.[1];
  const url = get("UPSTASH_REDIS_REST_URL");
  const token = get("UPSTASH_REDIS_REST_TOKEN");
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${url}/get/${encodeURIComponent(`shopify-otp:${email.toLowerCase()}`)}`, { headers: { Authorization: `Bearer ${token}` } });
    const body = (await res.json()) as { result: string | number | null };
    if (body.result !== null && body.result !== undefined) return String(body.result).replace(/"/g, "").padStart(6, "0");
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("one-time code not found");
}

test("SHOP-01 Shopify checkout: sign in to EboxSecure, pick a location, place the order", async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  await page.goto(STORE);
  if (/password/.test(page.url())) {
    await page.locator('input[type="password"]').fill("password");
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle").catch(() => {});
  }
  const variant = await page.evaluate(async () => {
    const j = await (await fetch("/products.json?limit=5")).json();
    return j.products.flatMap((p: any) => p.variants).find((v: any) => v.available).id;
  });
  await page.goto(`${STORE}/cart/${variant}:1`);
  await expect(page.getByText("Do you want to ship to an Ebox Pickup location?")).toBeVisible({ timeout: 60_000 });
  await page.locator('input[type="email"], input[name="email"]').first().fill(identityA.email);
  await shot(page, testInfo, "checkout with Ebox pickup option");

  await page.getByLabel(/Ship to Ebox Pickup location/).check({ force: true });
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Authenticate with Ebox")).toBeVisible();
  const modal = page.getByRole("dialog");
  // Unknown email: no code field for an account that does not exist.
  await modal.getByLabel("Email").fill("nobody.qa@example.com");
  await modal.getByRole("button", { name: /Send Code/ }).click();
  await page.waitForTimeout(4000);
  await shot(page, testInfo, "unknown email at checkout sign-in");
  console.log("UNKNOWN:", (await modal.innerText()).replace(/\s+/g, " ").slice(0, 300));

  await modal.getByLabel("Email").fill(identityA.email);
  await modal.getByRole("button", { name: /Send Code|Resend Code/ }).click();
  await expect(modal.getByLabel("One-Time Access Code")).toBeVisible({ timeout: 30_000 });
  await modal.getByLabel("One-Time Access Code").fill("000000");
  await modal.getByRole("button").filter({ hasText: /Authorize|Verify|Sign/ }).last().click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "wrong code rejected");
  console.log("WRONG CODE:", (await modal.innerText()).replace(/\s+/g, " ").slice(0, 300));

  const code = await readOtp(identityA.email);
  await modal.getByLabel("One-Time Access Code").fill(code);
  await modal.getByRole("button").filter({ hasText: /Authorize|Verify|Sign/ }).last().click();
  const select = page.getByLabel("Select your Ebox Location");
  await expect(select).toBeVisible({ timeout: 30_000 });
  if (await modal.isVisible().catch(() => false)) await page.keyboard.press("Escape");
  const options = await select.locator("option").allInnerTexts();
  console.log("LOCATIONS:", options.join(" | "));
  await shot(page, testInfo, "signed in location list");
  const flagship = options.find((o) => /Flagship|Rhettsbury/.test(o))!;
  await select.selectOption({ label: flagship });
  await expect(page.getByLabel("Address").first()).toHaveValue(/1964 Rhettsbury/i, { timeout: 20_000 });
  await page.waitForTimeout(4000);
  await shot(page, testInfo, "shipping address filled from location");
  console.log("NAME:", await page.getByLabel("First name").first().inputValue(), await page.getByLabel("Last name").first().inputValue());

  // The payment section reloads after the address changes; wait for it to settle before typing.
  await expect(page.getByText("Standard").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: /Pay now|Complete order/ })).toBeEnabled({ timeout: 60_000 });
  await page.waitForTimeout(8000);
  // Card fields live in separate secure frames: click each one and type.
  const typeInto = async (name: string, value: string) => {
    const frameEl = page.locator(`iframe[src*="/${name}-ltr.html"]`).first();
    await frameEl.scrollIntoViewIfNeeded();
    await frameEl.click();
    await page.keyboard.type(value, { delay: 80 });
  };
  await typeInto("number", "1");
  await typeInto("expiry", "1234");
  await typeInto("verification_value", "123");
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "payment entered");
  await page.getByRole("button", { name: /Pay now|Complete order/ }).click();
  await page.waitForURL(/thank[-_]you|orders\//, { timeout: 90_000 });
  await page.waitForTimeout(4000);
  await shot(page, testInfo, "order confirmation");
  console.log("CONFIRM:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 400));

  // The order must arrive in EboxSecure linked to the signed-in customer and chosen location.
  const prisma = db();
  const customer = await prisma.customerAccount.findFirstOrThrow({ where: { email: identityA.email } });
  let order: any = null;
  for (let i = 0; i < 20 && !order; i++) {
    order = await prisma.order.findFirst({ where: { customerId: customer.id, sourceChannel: "SHOPIFY" }, orderBy: { id: "desc" }, include: { lineItems: true } });
    if (!order) await new Promise((r) => setTimeout(r, 3000));
  }
  await prisma.$disconnect();
  expect(order).not.toBeNull();
  console.log("EBOX ORDER:", JSON.stringify({ id: order.id, vendorOrderId: order.vendorOrderId, total: order.total, loc: order.shippedLocationId, shop: order.shopifyShop, delivered: order.deliveredDate, items: order.lineItems.map((l: any) => l.title) }));
  expect(order.shippedLocationId).toBe(2);
  expect(order.deliveredDate).toBeNull();
});

test.describe("customer sees the Shopify order", () => {
  test.use({ storageState: ".auth/customer-a.json" });
  test("SHOP-02 Shopify order appears in the customer's orders as in transit", async ({ page }, testInfo) => {
    await page.goto(CLIENT_URL);
    await expect(page.getByText("In transit").first()).toBeVisible();
    await expect(page.getByText(/Your package is on its way to EboxSecure Flagship Location/).first()).toBeVisible();
    await shot(page, testInfo, "shopify order in transit with product");
  });
});
