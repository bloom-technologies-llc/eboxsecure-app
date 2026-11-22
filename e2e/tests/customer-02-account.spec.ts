import { readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { CLIENT_URL, TEST_PASSWORD } from "../lib/env";
import { shot } from "../lib/evidence";

const identityA = JSON.parse(readFileSync(".auth/customer-a.identity.json", "utf8"));
const identityB = JSON.parse(readFileSync(".auth/customer-b.identity.json", "utf8"));

test.describe("Customer A", () => {
  test.use({ storageState: ".auth/customer-a.json" });

  test("SET-01 name change is validated and saved", async ({ page }, testInfo) => {
    await page.goto(`${CLIENT_URL}/settings`);
    const first = page.locator("#firstName");
    await expect(first).toHaveValue(/Sarah/);
    const newName = (await first.inputValue()) === "Sarah-Jane" ? "Sarah" : "Sarah-Jane";
    await expect(page.locator("#email")).toHaveValue(identityA.email);
    await expect(page.locator("#email")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Save Name" })).toBeDisabled();

    await first.fill("   ");
    await page.getByRole("button", { name: "Save Name" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "First name is required." })).toBeVisible();
    await first.fill("S@rah!1");
    await page.getByRole("button", { name: "Save Name" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "can only contain letters" })).toBeVisible();
    await shot(page, testInfo, "invalid name rejected");

    await first.fill(newName);
    await page.getByRole("button", { name: "Save Name" }).click();
    await expect(page.getByText("Your name has been updated.").first()).toBeVisible();
    await shot(page, testInfo, "name saved");
    await page.reload();
    await expect(page.locator("#firstName")).toHaveValue(newName);
    await shot(page, testInfo, "name persists after reload");
  });

  test("SET-02 password change rejects mismatched, short and unchanged passwords", async ({ page }, testInfo) => {
    await page.goto(`${CLIENT_URL}/settings`);
    const submit = page.getByRole("button", { name: "Update Password" });
    // Profile fields enable once the page has loaded its data and is interactive.
    await expect(page.locator("#firstName")).toBeEnabled();
    await expect(submit).toBeDisabled();
    const fill = async (current: string, next: string, confirm: string) => {
      await page.locator("#currentPassword").fill(current);
      await page.locator("#newPassword").fill(next);
      await page.locator("#confirmPassword").fill(confirm);
      await expect(submit).toBeEnabled();
      await submit.click();
    };
    await fill(TEST_PASSWORD, "short1", "short1");
    await expect(page.getByRole("alert").filter({ hasText: "at least 8 characters" })).toBeVisible();
    await fill(TEST_PASSWORD, TEST_PASSWORD, TEST_PASSWORD);
    await expect(page.getByRole("alert").filter({ hasText: "must be different from your current password" })).toBeVisible();
    await fill(TEST_PASSWORD, "Another-Pass-2026!", "Another-Pass-2027!");
    await expect(page.getByRole("alert").filter({ hasText: "do not match" })).toBeVisible();
    await shot(page, testInfo, "mismatch rejected");
    await fill("Wrong-current-2026!", "Another-Pass-2026!", "Another-Pass-2026!");
    await expect(page.getByRole("alert").filter({ hasText: /password/i })).toBeVisible();
    await shot(page, testInfo, "wrong current password rejected");
  });

  test("LOC-01 favorite locations: search, add, primary, plan limit, remove", async ({ page }, testInfo) => {
    await page.goto(`${CLIENT_URL}/locations`);
    await page.getByText(/\d of 3 locations/).waitFor();
    // Start from a clean slate so the case is repeatable.
    while (await page.locator('.grid button[aria-haspopup="menu"]').count()) {
      await page.locator('.grid button[aria-haspopup="menu"]').first().click();
      await page.getByRole("menuitem", { name: /Remove/ }).click();
      await page.waitForTimeout(1500);
    }
    await expect(page.getByText("0 of 3 locations")).toBeVisible();
    await expect(page.getByText("No favorite locations yet.")).toBeVisible();
    const search = page.getByPlaceholder("Search for locations...");

    const searchFor = async (query: string) => {
      await search.click();
      await search.press("ControlOrMeta+a");
      await search.press("Backspace");
      await search.pressSequentially(query, { delay: 30 });
    };

    const addFavorite = async (locationName: string) => {
      await searchFor("Location");
      const row = page.locator("a", { has: page.getByRole("heading", { name: locationName, exact: true }) });
      await row.getByRole("button", { name: "Add" }).click();
      // The confirm button is clickable before the location has loaded and does
      // nothing until it has, so wait for the location name first.
      await page.getByRole("dialog").getByRole("heading", { name: locationName, exact: true }).waitFor();
      await page.getByRole("dialog").getByRole("button", { name: "Add to Favorites" }).click();
      await expect(page.getByText("Location added to favorites!").first()).toBeVisible();
    };

    await searchFor("L");
    await page.waitForTimeout(1200);
    await expect(page.getByRole("heading", { name: "EboxSecure Flagship Location" })).toHaveCount(0);
    await searchFor("Location");
    await expect(page.getByRole("heading", { name: "EboxSecure Flagship Location" })).toBeVisible();
    await shot(page, testInfo, "search results");

    await addFavorite("EboxSecure Flagship Location");
    await expect(page.getByText("1 of 3 locations")).toBeVisible();
    await expect(page.getByText("Primary", { exact: true })).toBeVisible();
    await shot(page, testInfo, "first favorite is primary");

    await addFavorite("Location #2");
    await addFavorite("Location #3");
    await expect(page.getByText("3 of 3 locations")).toBeVisible();

    await searchFor("Location");
    const fourth = page.locator("a", { has: page.getByRole("heading", { name: "Location #4", exact: true }) });
    await expect(fourth.getByRole("button", { name: "Add" })).toBeDisabled();
    await shot(page, testInfo, "limit reached add disabled");
    await search.blur();
    await page.waitForTimeout(600);

    await page.locator('.grid button[aria-haspopup="menu"]').last().click();
    await page.getByRole("menuitem", { name: /Remove/ }).click();
    await expect(page.getByText("Location removed from favorites").first()).toBeVisible();
    await expect(page.getByText("2 of 3 locations")).toBeVisible();
    await shot(page, testInfo, "counter updates after removal");
  });

  test("VA-01 customer creates a virtual address", async ({ page }, testInfo) => {
    await page.goto(CLIENT_URL);
    await page.getByRole("button", { name: "Create Now" }).click();
    await expect(page.getByText(/CUST-[A-F0-9]{6}/).first()).toBeVisible();
    await shot(page, testInfo, "virtual address shown");
    await page.reload();
    await expect(page.getByText(/CUST-[A-F0-9]{6}/).first()).toBeVisible();
  });

  test("TC-01 trusted contacts: self-invite, duplicate and limit of 3 are enforced", async ({ page }, testInfo) => {
    await page.goto(`${CLIENT_URL}/settings/trusted-contacts`);
    const invite = async (email: string) => {
      await page.getByRole("button", { name: "Add Contact" }).click();
      await page.getByPlaceholder("Enter email address").fill(email);
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("button", { name: "Send Invitation" }).click();
    };

    await invite(identityA.email.toUpperCase());
    await expect(page.getByText("Cannot add yourself as a trusted contact").first()).toBeVisible();
    await shot(page, testInfo, "self invite rejected");
    await page.keyboard.press("Escape");
    await page.reload();

    await page.getByText(/\(\d\/3\)/).waitFor();
    await page.waitForTimeout(1500);
    if (await page.getByText(identityB.email).count()) {
      // Already invited or accepted on an earlier run: a repeat invite must be refused.
      await invite(identityB.email);
      await expect(page.getByText("Failed to send invitation").first()).toBeVisible();
      await shot(page, testInfo, "repeat invite to existing contact rejected");
      await page.keyboard.press("Escape");
    } else {
      await invite(identityB.email);
      await expect(page.getByText("Invitation Sent").first()).toBeVisible();
      await expect(page.getByText("Sent Invitations")).toBeVisible();
      await shot(page, testInfo, "invitation to existing user sent");
    }
    await page.reload();

    const outsider1 = `ebox.qa.outsider1.${Date.now()}+clerk_test@example.com`;
    const outsider2 = `ebox.qa.outsider2.${Date.now()}+clerk_test@example.com`;
    await invite(outsider1);
    await expect(page.getByText("Invitation Sent").first()).toBeVisible();
    await page.reload();
    await invite(outsider1);
    await expect(page.getByText("You have already invited this person").first()).toBeVisible();
    await shot(page, testInfo, "duplicate invite rejected");
    await page.keyboard.press("Escape");
    await page.reload();

    await invite(outsider2);
    await expect(page.getByText("Invitation Sent").first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Add Contact" })).toBeDisabled();
    await shot(page, testInfo, "add disabled at three including pending");
  });
});

test.describe("Customer B", () => {
  test.use({ storageState: ".auth/customer-b.json" });

  test("TC-02 invited customer accepts the trusted contact invitation", async ({ page }, testInfo) => {
    await page.goto(`${CLIENT_URL}/settings/trusted-contacts`);
    await expect(page.getByText("Pending Invitations")).toBeVisible();
    await shot(page, testInfo, "pending invitation visible");
    await page.getByRole("button", { name: "Accept" }).click();
    await expect(page.getByText("Accounts You Can Access")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Accounts You Can Access")).toBeVisible();
    await shot(page, testInfo, "invitation accepted");
  });
});
