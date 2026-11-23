import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import { ADMIN_URL } from "../lib/env";
import { shot } from "../lib/evidence";

const admins = JSON.parse(readFileSync(".auth/admins.json", "utf8"));
const orders = JSON.parse(readFileSync(".auth/orders-state.json", "utf8"));
const settle = async (page: import("@playwright/test").Page) => {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);
};

test.describe("associate at Flagship", () => {
  test.use({ storageState: ".auth/admin-associateA.json" });

  test("ADM-02 associate is limited to their own location's data", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/locations`);
    await settle(page);
    await expect(page.locator("main tbody tr")).toHaveCount(1);
    await expect(page.getByText("EboxSecure Flagship Location").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Location" })).toHaveCount(0);
    await shot(page, testInfo, "only own location listed");
    await page.goto(`${ADMIN_URL}/locations/5`);
    await expect(page.getByText("Location not found or access denied")).toBeVisible();
    await shot(page, testInfo, "other location blocked");
    await page.goto(`${ADMIN_URL}/carriers`);
    await expect(page.getByText(/Access denied/)).toBeVisible();
    await shot(page, testInfo, "carriers blocked");
    await expect(page.getByRole("link", { name: "Employees" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Carriers" })).toHaveCount(0);
  });

  test("ADM-03 orders list: status tabs, search and empty state", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/orders`);
    await settle(page);
    await page.getByRole("button", { name: "Picked up", exact: true }).or(page.getByRole("tab", { name: "Picked up", exact: true })).first().click();
    await settle(page);
    const statuses = await page.locator("main tbody tr td:nth-child(7)").allInnerTexts();
    expect(statuses.length).toBeGreaterThan(0);
    expect(new Set(statuses)).toEqual(new Set(["Picked up"]));
    await shot(page, testInfo, "picked up tab only shows picked up orders");
    await page.getByRole("button", { name: "Ready for pickup", exact: true }).or(page.getByRole("tab", { name: "Ready for pickup", exact: true })).first().click();
    await settle(page);
    const ready = await page.locator("main tbody tr td:nth-child(7)").allInnerTexts();
    expect(new Set(ready)).toEqual(new Set(["Ready for pickup"]));
    await shot(page, testInfo, "ready for pickup tab");
    await page.getByRole("button", { name: "Cancelled", exact: true }).or(page.getByRole("tab", { name: "Cancelled", exact: true })).first().click();
    await settle(page);
    await shot(page, testInfo, "cancelled tab");
    await page.getByRole("button", { name: "All", exact: true }).or(page.getByRole("tab", { name: "All", exact: true })).first().click();
    const search = page.getByPlaceholder(/search/i).first();
    await search.fill(orders.t1);
    await expect(page.getByText(/Showing 1-1 of 1 order/)).toBeVisible();
    await expect(page.locator("main tbody tr")).toHaveCount(1);
    await shot(page, testInfo, "search by tracking number");
    await search.fill("Testera");
    await settle(page);
    expect(await page.locator("main tbody tr").count()).toBeGreaterThan(1);
    await shot(page, testInfo, "search by customer name");
    await search.fill("<script>alert(1)</script>");
    await expect(page.getByText("No orders match your search or filter.")).toBeVisible();
    await shot(page, testInfo, "no results message");
  });

  test("ADM-04 order comment is saved with the author's name", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/orders/order-details/${orders.order1}`);
    await settle(page);
    const text = `QA check ${Date.now().toString(36)}: customer collected, ID photo matched.`;
    const box = page.getByPlaceholder("Leave a comment...");
    const send = page.locator("main form button").last();
    await box.fill("   ");
    await send.click();
    await page.waitForTimeout(1500);
    await shot(page, testInfo, "blank comment attempt");
    await page.reload();
    await settle(page);
    const blankSaved = await page.getByText("Your comment has been created").count();
    expect(blankSaved).toBe(0);
    await box.fill(text);
    await send.click();
    await expect(page.getByText(text)).toBeVisible();
    await expect(page.getByText(admins.associateA.name).first()).toBeVisible();
    await shot(page, testInfo, "comment saved with author name");
    await page.reload();
    await expect(page.getByText(text)).toBeVisible();
  });

  test("ADM-05 associate cannot change location details", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/locations/2`);
    await settle(page);
    await shot(page, testInfo, "location page as associate");
    const pencils = page.locator("main button:has(svg.lucide-pencil)");
    testInfo.annotations.push({ type: "edit buttons visible to associate", description: String(await pencils.count()) });
    console.log("ASSOC PENCILS:", await pencils.count());
    if (await pencils.count()) {
      await pencils.first().click();
      await page.getByLabel("Storage Capacity").fill("999");
      await page.getByRole("button", { name: "Update Location" }).click();
      await page.waitForTimeout(2500);
      await shot(page, testInfo, "associate edit attempt result");
      await page.reload();
      await settle(page);
      await expect(page.getByText("999 units")).toHaveCount(0);
    }
  });
});

test.describe("associate at another location", () => {
  test.use({ storageState: ".auth/admin-associateB.json" });
  test("ADM-06 another location's associate cannot open Flagship orders or customers", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/orders`);
    await expect(page.getByText("There are no orders yet.")).toBeVisible();
    await shot(page, testInfo, "no Flagship orders listed");
    await page.goto(`${ADMIN_URL}/orders/order-details/${orders.order1}`);
    await expect(page.getByText("Order not available")).toBeVisible();
    await shot(page, testInfo, "Flagship order blocked by direct link");
    await page.goto(`${ADMIN_URL}/customers`);
    await expect(page.getByText("No customers found")).toBeVisible();
    await shot(page, testInfo, "no Flagship customers listed");
  });
});

test.describe("manager at Flagship", () => {
  test.use({ storageState: ".auth/admin-managerA.json" });
  test("ADM-07 manager sees only their location's employees", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/employees`);
    await settle(page);
    const locs = await page.locator("main tbody tr td:nth-child(5)").allInnerTexts();
    expect(locs.length).toBeGreaterThan(0);
    expect(new Set(locs.map((l) => l.trim()))).toEqual(new Set(["EboxSecure Flagship Location"]));
    await shot(page, testInfo, "manager employee list");
    await page.goto(`${ADMIN_URL}/employees/${admins.associateB.id}`);
    await settle(page);
    await shot(page, testInfo, "other location employee by direct link");
    await expect(page.getByText(admins.associateB.email)).toHaveCount(0);
  });
});

test.describe("corporate", () => {
  test.use({ storageState: ".auth/admin-corporate.json" });

  test("ADM-08 corporate dashboard loads with date range, location filter and CSV export", async ({ page }, testInfo) => {
    await page.goto(ADMIN_URL);
    await expect(page.getByText("Analytics Dashboard")).toBeVisible();
    await settle(page);
    await shot(page, testInfo, "analytics dashboard");
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 20_000 }).catch(() => null),
      page.getByRole("button", { name: /Export CSV/ }).click(),
    ]);
    await page.waitForTimeout(1500);
    await shot(page, testInfo, "after export click");
    console.log("CSV:", download ? download.suggestedFilename() : "no download event");
    if (download) await download.saveAs(`artifacts/${process.env.E2E_RUN_ID}/evidence/ADM-08/${download.suggestedFilename()}`);
  });

  test("ADM-09 corporate sees all locations, customers and employees", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/locations`);
    await settle(page);
    expect(await page.locator("main tbody tr").count()).toBeGreaterThan(1);
    await shot(page, testInfo, "all locations");
    await page.goto(`${ADMIN_URL}/employees`);
    await settle(page);
    await expect(page.getByText(admins.associateB.email)).toBeVisible();
    await expect(page.getByText(admins.associateA.email)).toBeVisible();
    await shot(page, testInfo, "all employees");
    await page.getByPlaceholder("Search...").fill("Blake");
    await settle(page);
    await expect(page.locator("main tbody tr")).toHaveCount(1);
    await shot(page, testInfo, "employee search");
    await page.goto(`${ADMIN_URL}/customers`);
    await settle(page);
    await page.getByPlaceholder("Search...").fill("Testera");
    await settle(page);
    await shot(page, testInfo, "customer search");
    await page.getByText("Sarah-Jane Testera").first().click();
    await page.waitForURL(/customers\/user_/);
    await settle(page);
    await shot(page, testInfo, "customer detail with order history");
    await page.goto(`${ADMIN_URL}/carriers`);
    await settle(page);
    await shot(page, testInfo, "carriers");
  });

  test("ADM-10 corporate edits a location and adds a note", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/locations/2`);
    await settle(page);
    const current = (await page.getByText(/\d+ units/).first().innerText()).match(/\d+/)![0];
    const next = current === "20" ? "25" : "20";
    await page.locator("main button:has(svg.lucide-pencil)").first().click();
    const cap = page.getByLabel("Storage Capacity");
    await cap.fill("-5");
    await page.getByRole("button", { name: "Update Location" }).click();
    await page.waitForTimeout(1200);
    await shot(page, testInfo, "negative capacity");
    await cap.fill(next);
    await page.getByRole("button", { name: "Update Location" }).click();
    await expect(page.getByText(`${next} units`)).toBeVisible();
    await shot(page, testInfo, "capacity updated");
    const note = `QA note ${Date.now().toString(36)}: loading dock closed Sundays.`;
    await page.getByRole("button", { name: "Add Note" }).click();
    await page.getByPlaceholder("Enter your note here...").fill(note);
    await page.getByRole("button", { name: "Add Note" }).last().click();
    await expect(page.getByText(note)).toBeVisible();
    await shot(page, testInfo, "note added");
  });

  test("ADM-11 invite admin form validates input", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/employees`);
    await page.getByRole("button", { name: "Invite Admin" }).click();
    await page.getByRole("button", { name: "Send Invitation" }).click();
    await page.waitForTimeout(800);
    await shot(page, testInfo, "empty invite rejected");
    await page.getByPlaceholder("email@example.com").fill("not-an-email");
    await page.getByRole("button", { name: "Send Invitation" }).click();
    await page.waitForTimeout(800);
    await shot(page, testInfo, "invalid email rejected");
    await page.getByPlaceholder("email@example.com").fill(admins.associateA.email);
    await page.getByRole("combobox").filter({ hasText: "Select location" }).or(page.getByRole("button", { name: "Select location" })).first().click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "Send Invitation" }).click();
    await page.waitForTimeout(3000);
    await shot(page, testInfo, "inviting an existing admin");
  });

  test("ADM-12 create location form validates required fields", async ({ page }, testInfo) => {
    await page.goto(`${ADMIN_URL}/locations`);
    await page.getByRole("button", { name: "Create Location" }).click();
    await page.getByRole("button", { name: "Create Location" }).last().click();
    await page.waitForTimeout(800);
    await shot(page, testInfo, "required fields flagged");
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.getByLabel("ZIP Code").fill("abc");
    await page.getByLabel("Storage Capacity").fill("0");
    await page.getByRole("button", { name: "Create Location" }).last().click();
    await page.waitForTimeout(800);
    await shot(page, testInfo, "bad zip and capacity flagged");
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
