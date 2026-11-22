import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { CLERK_TEST_CODE, CLIENT_URL, TEST_PASSWORD } from "./env";

export interface Identity {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

/** Types the Clerk test verification code into whichever OTP step is showing. */
export async function enterClerkCode(page: Page) {
  const otp = page.locator('input[autocomplete="one-time-code"]').first();
  await otp.waitFor({ state: "visible", timeout: 30_000 });
  await otp.click();
  await page.keyboard.type(CLERK_TEST_CODE, { delay: 60 });
}

/** Customer sign-up on client-web: form, email code, phone code, lands on /payment. */
export async function signUpCustomer(page: Page, id: Identity) {
  await page.goto(`${CLIENT_URL}/sign-up`);
  await page.locator("#firstName-field").fill(id.firstName);
  await page.locator("#lastName-field").fill(id.lastName);
  await page.locator("#emailAddress-field").fill(id.email);
  await page.locator("#phoneNumber-field").fill(id.phone);
  await page.locator("#password-field").fill(TEST_PASSWORD);
}

export async function signInCustomer(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto(`${CLIENT_URL}/sign-in`);
  await page.locator("#identifier-field").fill(email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#password-field").fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

export const STRIPE_CARDS = {
  success: "4242 4242 4242 4242",
  declined: "4000 0000 0000 0002",
  insufficientFunds: "4000 0000 0000 9995",
  threeDSecure: "4000 0025 0000 3155",
} as const;

/** Fills Stripe's hosted Checkout page with a test card. Does not submit. */
export async function fillStripeCheckout(page: Page, card: string, name: string) {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  const cardNumber = page.locator("#cardNumber");
  if (!(await cardNumber.isVisible({ timeout: 15_000 }).catch(() => false))) {
    // Payment methods are collapsed into an accordion: open "Card".
    await page.locator('[data-testid="card-accordion-item"], #payment-method-accordion-item-title-card').first().click();
  }
  await cardNumber.fill(card);
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  const billingName = page.locator("#billingName");
  if (await billingName.isVisible().catch(() => false)) await billingName.fill(name);
  const country = page.locator("#billingCountry");
  if (await country.isVisible().catch(() => false)) await country.selectOption("US");
  const zip = page.locator("#billingPostalCode");
  if (await zip.isVisible().catch(() => false)) await zip.fill("46032");
  // Decline "save my info with Link" so no phone prompt blocks submission.
  const link = page.locator("#enableStripePass");
  if (await link.isChecked().catch(() => false)) await link.uncheck();
}

export async function submitStripeCheckout(page: Page) {
  await page.locator('[data-testid="hosted-payment-submit-button"]').click();
}

export { expect };
