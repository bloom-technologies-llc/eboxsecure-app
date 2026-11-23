import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { CLIENT_URL } from "../lib/env";
import { shot } from "../lib/evidence";

test.use({ storageState: ".auth/customer-a.json" });

test("NOTIF-01 notification settings: toggles, validation and persistence", async ({ page }, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings/notifications`);
  await page.getByRole("heading", { name: "Notification Settings" }).waitFor();
  const sw = page.getByRole("switch");
  await expect(sw).toHaveCount(3);
  const state = async () => Promise.all([0, 1, 2].map((i) => sw.nth(i).getAttribute("aria-checked")));
  console.log("INITIAL:", await state());
  await shot(page, testInfo, "initial settings");
  // SMS on with no phone number
  if ((await sw.nth(2).getAttribute("aria-checked")) !== "true") await sw.nth(2).click();
  await shot(page, testInfo, "sms disclosure and phone field");
  await page.locator("#phoneNumber").fill("");
  await page.getByRole("button", { name: /Save/ }).click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "sms on without phone number");
  console.log("NO PHONE:", (await page.locator('[role="status"], li[role="status"], [data-state="open"]').allInnerTexts()).join(" | ").slice(0, 300));
  await page.locator("#phoneNumber").fill("abc");
  await page.getByRole("button", { name: /Save/ }).click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "invalid phone number");
  console.log("BAD PHONE:", (await page.locator('[role="status"], li[role="status"], [data-state="open"]').allInnerTexts()).join(" | ").slice(0, 300));
  // invalid notification email
  await page.locator("#phoneNumber").fill("+1 (317) 555-0142");
  await page.getByPlaceholder("Enter email for notifications").fill("not-an-email");
  await page.getByRole("button", { name: /Save/ }).click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "invalid notification email");
  console.log("BAD EMAIL:", (await page.locator('[role="status"], li[role="status"], [data-state="open"]').allInnerTexts()).join(" | ").slice(0, 300));
  // valid save
  await page.getByPlaceholder("Enter email for notifications").fill("qa.alerts@example.com");
  if ((await sw.nth(0).getAttribute("aria-checked")) === "true") await sw.nth(0).click();
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(page.getByText("Notification settings saved").first()).toBeVisible();
  await shot(page, testInfo, "settings saved");
  await page.reload();
  await page.getByRole("heading", { name: "Notification Settings" }).waitFor();
  await expect(sw.nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(sw.nth(2)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByPlaceholder("Enter email for notifications")).toHaveValue("qa.alerts@example.com");
  await shot(page, testInfo, "settings persist after reload");
  console.log("PHONE AFTER:", await page.locator("#phoneNumber").inputValue());
  // restore
  await sw.nth(0).click();
  await sw.nth(2).click();
  await page.getByPlaceholder("Enter email for notifications").fill("");
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(page.getByText("Notification settings saved").first()).toBeVisible();
});

test("SET-03 delete account control", async ({ page }, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings`);
  await page.getByRole("button", { name: "Delete Account" }).click();
  await page.waitForTimeout(2500);
  await shot(page, testInfo, "after clicking delete account");
  console.log("DELETE:", page.url(), await page.locator('[role="dialog"], [role="alertdialog"]').count());
});

test("TC-03 pending invitations can be cancelled and several sent in a row", async ({ page }, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings/trusted-contacts`);
  await page.getByText(/\(\d\/3\)/).waitFor();
  await page.waitForTimeout(1500);
  await shot(page, testInfo, "three of three used");
  while (await page.getByRole("button", { name: "Cancel", exact: true }).count()) {
    await page.getByRole("button", { name: "Cancel", exact: true }).first().click();
    await page.waitForTimeout(2500);
  }
  await expect(page.getByText("(1/3)")).toBeVisible();
  await shot(page, testInfo, "pending invitations cancelled");
  const invite = async (email: string) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await page.getByPlaceholder("Enter email address").fill(email);
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Send Invitation" }).click();
  };
  // Two invitations back to back with no page reload (regression check for the "Sending..." defect).
  const stamp = Date.now();
  await invite(`ebox.qa.outsider3.${stamp}+clerk_test@example.com`);
  await expect(page.getByText("Invitation Sent").first()).toBeVisible();
  await expect(page.getByText("(2/3)")).toBeVisible();
  await invite(`ebox.qa.outsider4.${stamp}+clerk_test@example.com`);
  await expect(page.getByText("(3/3)")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Contact" })).toBeDisabled();
  await shot(page, testInfo, "two invitations sent in a row without reload");
});
