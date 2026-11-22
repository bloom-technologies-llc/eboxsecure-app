export const CLIENT_URL = process.env.CLIENT_URL ?? "https://app-qa.eboxsecure.com";
export const ADMIN_URL = process.env.ADMIN_URL ?? "https://admin-qa.eboxsecure.com";
export const MARKETING_URL = process.env.MARKETING_URL ?? "";
export const RUN_ID = process.env.E2E_RUN_ID ?? "local";

/** Clerk test-mode verification code (email + SMS) for `+clerk_test` identities. */
export const CLERK_TEST_CODE = "424242";
export const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "Ebox-QA-test-2026!";

/** A unique Clerk test identity. Test emails never deliver; test phones are 555-01xx. */
export function testIdentity(label: string) {
  const unique = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
  const area = 201 + Math.floor(Math.random() * 700);
  const line = String(100 + Math.floor(Math.random() * 100)).padStart(4, "0");
  return {
    email: `ebox.qa.${label}.${unique}+clerk_test@example.com`,
    phone: `${area}5550${line.slice(1)}`,
    firstName: "Sarah",
    lastName: `Tester${label.replace(/[^a-z]/gi, "")}`,
  };
}
