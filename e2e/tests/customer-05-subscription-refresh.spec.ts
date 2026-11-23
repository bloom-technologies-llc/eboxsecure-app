import { expect, test } from "@playwright/test";

import { CLIENT_URL } from "../lib/env";
import { shot } from "../lib/evidence";

test.use({ storageState: ".auth/customer-b.json" });

test("SUB-06 plan page updates without a reload and shows customer-facing plan names", async ({ page }, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings/subscription`);
  await page.getByText("Your active subscription details").waitFor();
  await expect(page.getByText("Premium Plan")).toBeVisible();
  await expect(page.getByText(/BASIC_PLUS|PREMIUM |BUSINESS_PRO/)).toHaveCount(0);
  await shot(page, testInfo, "plan names");
  await page.getByRole("button", { name: "Cancel Plan" }).click();
  await expect(page.locator('[role="dialog"]').getByText(/cancel your Premium subscription/)).toBeVisible();
  await page.locator('[role="dialog"]').getByRole("button", { name: "Cancel Subscription" }).click();
  // No reload: the page must reflect the change on its own.
  await expect(page.getByText(/Cancels on \d+\/\d+\/\d+/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Reactivate" })).toBeVisible();
  await shot(page, testInfo, "cancelled shown without reload");
  await page.getByRole("button", { name: "Reactivate" }).click();
  await page.getByRole("button", { name: "Confirm Reactivation" }).click();
  await expect(page.getByRole("button", { name: "Cancel Plan" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Cancels on/)).toHaveCount(0);
  await shot(page, testInfo, "reactivated shown without reload");
  await expect(page.getByRole("switch", { name: "Bill yearly" })).toBeVisible();
});
