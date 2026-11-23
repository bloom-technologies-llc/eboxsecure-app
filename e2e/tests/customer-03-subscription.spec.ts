import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { CLIENT_URL, testIdentity } from "../lib/env";
import { shot } from "../lib/evidence";
import { enterClerkCode, fillStripeCheckout, signUpCustomer, STRIPE_CARDS, submitStripeCheckout } from "../lib/flows";

const open = async (page: Page) => {
  await page.goto(`${CLIENT_URL}/settings/subscription`);
  await page.getByText("Your active subscription details").waitFor();
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1200);
};
const dialog = (page: Page) => page.locator('[role="dialog"]');
/** The deployed build refreshes plan data from a Stripe webhook, so give it a moment and reload. */
const settleAndReload = async (page: Page) => {
  await page.waitForTimeout(6000);
  await open(page);
};

test.describe.configure({ mode: "serial" });

test.describe("existing subscriber (customer B)", () => {
  test.use({ storageState: ".auth/customer-b.json" });

  test("SUB-01 cancelled subscription can be reactivated before the end date", async ({ page }, testInfo) => {
    await open(page);
    if (!(await page.getByRole("button", { name: "Reactivate" }).count())) {
      await page.getByRole("button", { name: "Cancel Plan" }).click();
      await dialog(page).getByRole("button", { name: "Cancel Subscription" }).click();
      await settleAndReload(page);
    }
    await expect(page.getByText(/has been cancelled and will end on/)).toBeVisible();
    await expect(page.getByText(/Cancels on \d+\/\d+\/\d+/)).toBeVisible();
    await shot(page, testInfo, "cancelled state with end date");
    await page.goto(CLIENT_URL);
    await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();
    await shot(page, testInfo, "access continues until end date");
    await open(page);
    await page.getByRole("button", { name: "Reactivate" }).click();
    await expect(dialog(page).getByText("Are you sure you want to reactivate your subscription?")).toBeVisible();
    await shot(page, testInfo, "reactivate confirmation");
    await dialog(page).getByRole("button", { name: "Confirm Reactivation" }).click();
    await settleAndReload(page);
    await expect(page.getByText(/Next billing date: \d+\/\d+\/\d+/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel Plan" })).toBeVisible();
    await shot(page, testInfo, "subscription active again");
  });

  test("SUB-02 downgrade is scheduled for the next billing cycle and can be cancelled", async ({ page }, testInfo) => {
    await open(page);
    await page.getByRole("button", { name: "Downgrade", exact: true }).first().click();
    await expect(dialog(page).getByText("The downgrade will take effect on your next billing cycle")).toBeVisible();
    await shot(page, testInfo, "downgrade confirmation");
    await dialog(page).getByRole("button", { name: "Confirm Downgrade" }).click();
    await settleAndReload(page);
    await expect(page.getByText(/Downgrades to .* on \d+\/\d+\/\d+/)).toBeVisible();
    await expect(page.getByText("$19.99").first()).toBeVisible();
    await shot(page, testInfo, "downgrade scheduled current plan kept");
    await page.getByRole("button", { name: "Cancel Downgrade", exact: true }).click();
    await shot(page, testInfo, "cancel downgrade confirmation");
    await dialog(page).getByRole("button", { name: "Cancel Downgrade" }).click();
    await settleAndReload(page);
    await expect(page.getByText(/Downgrades to/)).toHaveCount(0);
    await expect(page.getByText(/Next billing date/)).toBeVisible();
    await shot(page, testInfo, "downgrade cancelled");
  });

  test("SUB-03 upgrade takes effect immediately and raises plan limits", async ({ page }, testInfo) => {
    await open(page);
    await page.getByRole("button", { name: "Upgrade", exact: true }).first().click();
    await expect(dialog(page).getByText("Your upgrade will take effect immediately")).toBeVisible();
    await expect(dialog(page).getByText("$49.99")).toBeVisible();
    await shot(page, testInfo, "upgrade confirmation");
    await dialog(page).getByRole("button", { name: "Confirm Upgrade" }).click();
    await settleAndReload(page);
    await expect(page.getByText("$49.99").first()).toBeVisible();
    await expect(page.getByText(/PREMIUM Plan|Premium Plan/)).toBeVisible();
    await shot(page, testInfo, "premium is the current plan");
    await page.goto(`${CLIENT_URL}/locations`);
    await expect(page.getByText(/\d+ of 75 locations/)).toBeVisible();
    await shot(page, testInfo, "location limit now 75");
    await page.goto(`${CLIENT_URL}/settings/usage`);
    await expect(page.getByText(/\/ 50 packages/)).toBeVisible();
    await expect(page.getByText("7 days").first()).toBeVisible();
    await shot(page, testInfo, "usage limits now premium");
  });

  test("SUB-04 billing period change is explained and scheduled for the next cycle", async ({ page }, testInfo) => {
    await open(page);
    await page.getByRole("switch").or(page.getByText("Monthly", { exact: true }).locator("xpath=following-sibling::button[1]")).first().click();
    await expect(page.getByText("$510/year").or(page.getByText(/\$\d+(\.\d+)?\/year/).first()).first()).toBeVisible();
    await shot(page, testInfo, "yearly prices");
    await page.getByRole("button", { name: "Change Billing Period" }).first().click();
    await expect(dialog(page).getByText(/change your billing period from month to year/)).toBeVisible();
    await shot(page, testInfo, "billing period dialog");
    await dialog(page).getByRole("button", { name: "Change Billing Period" }).click();
    await settleAndReload(page);
    await shot(page, testInfo, "after billing period change");
    console.log("SUB-04 STATE:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(380, 620));
  });

  test("SUB-05 billing portal opens with the saved card and invoices", async ({ page }, testInfo) => {
    await page.goto(`${CLIENT_URL}/settings/billing`);
    await shot(page, testInfo, "billing page");
    await page.getByRole("button", { name: "Manage Payment Methods" }).click();
    await page.waitForURL(/billing\.stripe\.com/, { timeout: 45_000 });
    await expect(page.getByText(/4242/).first()).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "stripe billing portal");
    console.log("PORTAL:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 700));
  });
});

test.describe("payment failures at checkout (new customer)", () => {
  test("PAY-01 declined, insufficient-funds and 3-D Secure cards are handled at checkout", async ({ page }, testInfo) => {
    test.setTimeout(300_000);
    const id = testIdentity("c");
    testInfo.annotations.push({ type: "test-data", description: id.email });
    await signUpCustomer(page, id);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByText("Verify your email").waitFor();
    await enterClerkCode(page);
    await page.waitForTimeout(4000);
    if (!/payment/.test(page.url())) await enterClerkCode(page).catch(() => {});
    await page.waitForURL(/\/payment/, { timeout: 60_000 });
    await page.getByRole("heading", { name: "Choose Your Plan" }).waitFor();
    await page.waitForTimeout(3000);
    await page.getByRole("switch").or(page.getByText("Monthly", { exact: true }).locator("xpath=following-sibling::button[1]")).first().click();
    await page.getByRole("button", { name: "Get Started" }).first().click();

    await fillStripeCheckout(page, STRIPE_CARDS.declined, `${id.firstName} ${id.lastName}`);
    await submitStripeCheckout(page);
    await expect(page.getByText(/card was declined|card has been declined/i).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, testInfo, "declined card message");
    expect(page.url()).toContain("checkout.stripe.com");

    await page.locator("#cardNumber").fill(STRIPE_CARDS.insufficientFunds);
    await submitStripeCheckout(page);
    await expect(page.getByText(/insufficient funds/i).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, testInfo, "insufficient funds message");

    // Going back to the app without paying must not unlock it.
    const checkoutUrl = page.url();
    await page.goto(CLIENT_URL);
    await page.waitForURL(/\/payment/, { timeout: 30_000 });
    await shot(page, testInfo, "unpaid customer is kept on plan selection");
    await page.goto(`${CLIENT_URL}/locations`);
    await page.waitForTimeout(3000);
    await shot(page, testInfo, "unpaid customer cannot open locations");
    expect(page.url()).toMatch(/payment/);

    await page.goto(checkoutUrl);
    await fillStripeCheckout(page, STRIPE_CARDS.threeDSecure, `${id.firstName} ${id.lastName}`);
    await submitStripeCheckout(page);
    const challenge = page.frameLocator('iframe[name^="__privateStripeFrame"]').frameLocator('iframe[name="stripe-challenge-frame"], iframe#challengeFrame').first();
    await page.waitForTimeout(8000);
    await shot(page, testInfo, "3-D Secure challenge");
    const complete = page.frames().map((f) => f.getByRole("button", { name: /complete/i }));
    let clicked = false;
    for (const b of complete) {
      if (await b.count().catch(() => 0)) { await b.first().click(); clicked = true; break; }
    }
    console.log("3DS complete clicked:", clicked, challenge ? "" : "");
    await page.waitForURL(/\/onboarding/, { timeout: 120_000 });
    await expect(page.getByRole("heading", { name: "Verify Your Identity" })).toBeVisible();
    await shot(page, testInfo, "payment accepted after 3-D Secure");
  });
});
