import { expect, test } from "@playwright/test";

import { shot } from "../lib/evidence";

const MARKETING =
  process.env.MARKETING_URL ??
  "https://eboxsecure-app-marketing-site-quw5491n8-bloom-technologies.vercel.app";

test.describe("Landing page forms", () => {
  test("MKT-01 contact form rejects empty and invalid input", async ({ page }, testInfo) => {
    await page.goto(`${MARKETING}/contact`);
    await page.getByRole("button", { name: "Submit Inquiry" }).click();
    await expect(page.getByText("Name must be at least 2 characters.")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await page.getByPlaceholder("Your name").fill("  ");
    await page.getByPlaceholder("you@example.com").fill("not-an-email");
    await page.getByRole("button", { name: "Submit Inquiry" }).click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await shot(page, testInfo, "validation errors shown");
  });

  test("MKT-02 contact form sends an inquiry", async ({ page }, testInfo) => {
    await page.goto(`${MARKETING}/contact`);
    await page.getByPlaceholder("Your name").fill("QA Tester");
    await page.getByPlaceholder("you@example.com").fill("qa.tester@example.com");
    await page.getByPlaceholder("(123) 456-7890").fill("(317) 555-0100");
    await page.getByPlaceholder("Your company").fill("QA Test Co");
    await page.getByPlaceholder("Tell us about your current delivery challenges").fill("Automated QA submission - please ignore.");
    await shot(page, testInfo, "form filled");
    await page.getByRole("button", { name: "Submit Inquiry" }).click();
    await expect(page.getByRole("status")).toContainText("Your inquiry was sent", { timeout: 30_000 });
    await shot(page, testInfo, "success message");
    await expect(page.getByPlaceholder("Your name")).toHaveValue("");
  });

  test("MKT-03 store integration request sends", async ({ page }, testInfo) => {
    await page.goto(`${MARKETING}/partners`);
    const form = page.locator("#request-a-store");
    await form.scrollIntoViewIfNeeded();
    await form.getByRole("button", { name: "Request Integration" }).click();
    await expect(form.getByText("Please tell us which store you'd like us to add.")).toBeVisible();
    await form.getByPlaceholder("Your name").fill("QA Tester");
    await form.getByPlaceholder("you@example.com").fill("qa.tester@example.com");
    await form.getByPlaceholder("The store you'd like us to add").fill("QA Example Outfitters");
    await form.getByPlaceholder("www.store.com").fill("www.example.com");
    await shot(page, testInfo, "request form filled");
    await form.getByRole("button", { name: "Request Integration" }).click();
    await expect(form.getByRole("status")).toContainText("QA Example Outfitters", { timeout: 30_000 });
    await shot(page, testInfo, "request success message");
  });

  test("MKT-04 pricing and get-started buttons reach the sign-up page", async ({ page }, testInfo) => {
    await page.goto(`${MARKETING}/pricing`);
    const cta = page.locator('a[href$="/sign-up"]').first();
    await expect(cta).toBeVisible();
    await shot(page, testInfo, "pricing page");
    await cta.click();
    await page.waitForURL(/\/sign-up/, { timeout: 30_000 });
    await expect(page.locator("#emailAddress-field")).toBeVisible();
    await shot(page, testInfo, "sign-up page reached");
  });
});
