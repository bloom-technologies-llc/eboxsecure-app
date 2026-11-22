import { test } from "@playwright/test";

const CLIENT = process.env.CLIENT_URL ?? "http://localhost:3000";

test("probe sign-up form", async ({ page }) => {
  await page.goto(`${CLIENT}/sign-up`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "artifacts/probe-signup.png", fullPage: true });
  const fields = await page.$$eval("input, button", (els) =>
    els.map((e) => `${e.tagName} name=${(e as HTMLInputElement).name} type=${(e as HTMLInputElement).type} text=${(e.textContent ?? "").trim().slice(0, 40)}`),
  );
  console.log(fields.join("\n"));
});
