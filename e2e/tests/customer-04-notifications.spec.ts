import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { CLIENT_URL } from "../lib/env";
import { shot } from "../lib/evidence";

test.use({ storageState: ".auth/customer-a.json" });

test("NOTIF-01 notification settings: toggles, validation and persistence", async ({
  page,
}, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings/notifications`);
  await page.getByRole("heading", { name: "Notification Settings" }).waitFor();
  const sw = page.getByRole("switch");
  await expect(sw).toHaveCount(3);
  const state = async () =>
    Promise.all([0, 1, 2].map((i) => sw.nth(i).getAttribute("aria-checked")));
  console.log("INITIAL:", await state());
  await shot(page, testInfo, "initial settings");
  // SMS on with no phone number
  if ((await sw.nth(2).getAttribute("aria-checked")) !== "true")
    await sw.nth(2).click();
  await shot(page, testInfo, "sms disclosure and phone field");
  await page.locator("#phoneNumber").fill("");
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(
    page.getByText(/Enter a valid 10-digit U.S. mobile number/).first(),
  ).toBeVisible();
  await shot(page, testInfo, "sms on without phone number rejected");
  await page.locator("#phoneNumber").fill("abc");
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(
    page.getByText(/Enter a valid 10-digit U.S. mobile number/).first(),
  ).toBeVisible();
  await shot(page, testInfo, "invalid phone number rejected");
  await page.locator("#phoneNumber").fill("+1 (317) 555-0142");
  await page
    .getByPlaceholder("Enter email for notifications")
    .fill("not-an-email");
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(
    page.getByText("Enter a valid notification email address.").first(),
  ).toBeVisible();
  await shot(page, testInfo, "invalid notification email rejected");
  // valid save
  await page
    .getByPlaceholder("Enter email for notifications")
    .fill("qa.alerts@example.com");
  if ((await sw.nth(0).getAttribute("aria-checked")) === "true")
    await sw.nth(0).click();
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(
    page.getByText("Notification settings saved").first(),
  ).toBeVisible();
  await shot(page, testInfo, "settings saved");
  await page.reload();
  await page.getByRole("heading", { name: "Notification Settings" }).waitFor();
  await expect(sw.nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(sw.nth(2)).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByPlaceholder("Enter email for notifications"),
  ).toHaveValue("qa.alerts@example.com");
  await shot(page, testInfo, "settings persist after reload");
  await expect(page.locator("#phoneNumber")).toHaveValue("+13175550142");
  // restore
  await sw.nth(0).click();
  await sw.nth(2).click();
  await page.getByPlaceholder("Enter email for notifications").fill("");
  await page.getByRole("button", { name: /Save/ }).click();
  await expect(
    page.getByText("Notification settings saved").first(),
  ).toBeVisible();
});

test("SET-03 delete account: customer can request deletion after confirming", async ({ page }, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings`);
  await page.getByRole("button", { name: "Delete Account" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Request account deletion" })).toBeVisible();
  await shot(page, testInfo, "deletion request confirmation");
  // Backing out must send nothing.
  await dialog.getByRole("button", { name: "Keep My Account" }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Delete Account" }).click();
  await dialog.getByRole("button", { name: "Request Deletion" }).click();
  await expect(dialog.getByRole("heading", { name: "Deletion request sent" })).toBeVisible({ timeout: 30_000 });
  await shot(page, testInfo, "deletion request sent");
  await dialog.getByRole("button", { name: "Close" }).first().click();
  // The account stays usable until the request is fulfilled.
  await page.goto(CLIENT_URL);
  await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();
});

test("TC-03 pending invitations can be cancelled and several sent in a row", async ({
  page,
}, testInfo) => {
  await page.goto(`${CLIENT_URL}/settings/trusted-contacts`);
  await page.getByText(/\(\d\/3\)/).waitFor();
  await page.waitForTimeout(1500);
  await shot(page, testInfo, "three of three used");
  while (
    await page.getByRole("button", { name: "Cancel", exact: true }).count()
  ) {
    await page
      .getByRole("button", { name: "Cancel", exact: true })
      .first()
      .click();
    await page.waitForTimeout(2500);
  }
  await expect(page.getByText("Sent Invitations")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add Contact" })).toBeEnabled();
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
  await expect(
    page.getByText("Waiting for sign-up", { exact: true }),
  ).toHaveCount(1);
  await invite(`ebox.qa.outsider4.${stamp}+clerk_test@example.com`);
  await expect(
    page.getByText("Waiting for sign-up", { exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Add Contact" }),
  ).toBeDisabled();
  await shot(page, testInfo, "two invitations sent in a row without reload");
});
