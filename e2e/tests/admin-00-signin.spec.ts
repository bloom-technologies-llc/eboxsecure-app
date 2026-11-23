import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { ADMIN_URL, CLERK_TEST_CODE } from "../lib/env";
import { shot } from "../lib/evidence";

const admins = JSON.parse(readFileSync(".auth/admins.json", "utf8"));

async function signInAdmin(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto(`${ADMIN_URL}/sign-in`);
  await page.locator("#identifier-field").fill(email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#password-field").fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  // New-device email verification appears on Clerk test instances; code is fixed.
  const otp = page.locator('input[autocomplete="one-time-code"]').first();
  const needsCode = await Promise.race([
    otp.waitFor({ state: "visible", timeout: 20_000 }).then(() => true).catch(() => false),
    page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 20_000 }).then(() => false).catch(() => false),
  ]);
  if (needsCode) {
    await otp.click();
    await page.keyboard.type(CLERK_TEST_CODE, { delay: 60 });
  }
  await page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 45_000 });
}

test("ADM-01a admin portal rejects a wrong password and redirects signed-out visitors", async ({ page }, testInfo) => {
  await page.goto(`${ADMIN_URL}/orders`);
  await expect(page).toHaveURL(/sign-in/);
  await shot(page, testInfo, "signed-out visitor sent to sign-in");
  await page.locator("#identifier-field").fill(admins.corporate.email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#password-field").fill("Wrong-password-2026!");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByTestId("form-feedback-error")).toBeVisible();
  await shot(page, testInfo, "wrong password rejected");
});

for (const key of ["corporate", "managerA", "associateA", "associateB"] as const) {
  test(`ADM-01-${key} ${key} signs in and sees the navigation for their role`, async ({ page }, testInfo) => {
    const a = admins[key];
    await signInAdmin(page, a.email, a.password);
    await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
    await page.waitForLoadState("networkidle").catch(() => {});
    await shot(page, testInfo, `${key} home after sign-in`);
    const nav = await page.locator('[data-sidebar="menu"] a, nav a').allInnerTexts();
    testInfo.annotations.push({ type: "nav", description: nav.join(" | ") });
    console.log(key, "NAV:", nav.join(" | "));
    await page.context().storageState({ path: `.auth/admin-${key}.json` });
  });
}
