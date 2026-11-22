import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { CLIENT_URL, testIdentity } from "../lib/env";
import { shot } from "../lib/evidence";
import {
  enterClerkCode,
  fillStripeCheckout,
  signUpCustomer,
  STRIPE_CARDS,
  submitStripeCheckout,
} from "../lib/flows";

/**
 * Creates a fresh customer end to end and saves its signed-in session to
 * .auth/customer-<label>.json for the other customer specs.
 */
for (const label of ["a", "b"]) {
  test(`CUST-01${label} new customer signs up, subscribes (Basic monthly) and completes photo onboarding`, async ({ page, context }, testInfo) => {
    test.setTimeout(200_000);
    const id = testIdentity(label);
    testInfo.annotations.push({ type: "test-data", description: `${id.email} / phone ${id.phone}` });

    await signUpCustomer(page, id);
    await shot(page, testInfo, "sign-up form filled");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByText("Verify your email").waitFor();
    await shot(page, testInfo, "email verification step");
    await enterClerkCode(page);
    await page.waitForTimeout(4000);
    if (!/payment/.test(page.url())) await enterClerkCode(page).catch(() => {});
    await page.waitForURL(/\/payment/, { timeout: 60_000 });

    await page.getByRole("heading", { name: "Choose Your Plan" }).waitFor();
    await page.waitForTimeout(3000);
    await shot(page, testInfo, "plan selection yearly default");
    await page.getByText("Monthly", { exact: true }).locator("xpath=following-sibling::button[1]").click();
    await expect(page.getByText("$9.99")).toBeVisible();
    await shot(page, testInfo, "plan selection monthly");
    await page.getByRole("button", { name: "Get Started" }).first().click();

    await fillStripeCheckout(page, STRIPE_CARDS.success, `${id.firstName} ${id.lastName}`);
    await shot(page, testInfo, "stripe checkout with test card");
    await submitStripeCheckout(page);
    await page.waitForURL(/\/onboarding/, { timeout: 120_000 });

    await expect(page.getByRole("heading", { name: "Verify Your Identity" })).toBeVisible();
    await shot(page, testInfo, "onboarding photo instructions");
    await page.getByRole("button", { name: "Take Portrait Photo" }).click();
    // Wait for the camera stream; capturing before the first frame arrives does nothing.
    await page.waitForFunction(() => {
      const video = document.querySelector("video");
      return !!video && video.readyState >= 2 && video.videoWidth > 0;
    }, undefined, { timeout: 30_000 });
    await page.waitForTimeout(1500);
    await shot(page, testInfo, "camera live view");
    await page.getByRole("button", { name: "Capture Photo" }).click();
    await page.getByRole("button", { name: "Use This Photo" }).waitFor({ timeout: 30_000 });
    await shot(page, testInfo, "portrait preview");
    await page.getByRole("button", { name: "Use This Photo" }).click();

    await page.waitForURL((u) => u.pathname === "/", { timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();
    await expect(page.getByText("You have no active orders.")).toBeVisible();
    await shot(page, testInfo, "orders home after onboarding");

    mkdirSync(".auth", { recursive: true });
    await context.storageState({ path: `.auth/customer-${label}.json` });
    writeFileSync(`.auth/customer-${label}.identity.json`, JSON.stringify(id, null, 2));
  });
}
