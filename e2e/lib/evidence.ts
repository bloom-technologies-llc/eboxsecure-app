import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";

import { RUN_ID } from "./env";

/**
 * Saves a numbered, captioned screenshot for the evidence pack and attaches it
 * to the Playwright report. Files land in artifacts/<run>/evidence/<test id>/.
 */
export async function shot(page: Page, testInfo: TestInfo, caption: string) {
  const testId = testInfo.title.split(" ")[0] ?? "TC";
  const dir = path.join("artifacts", RUN_ID, "evidence", testId);
  mkdirSync(dir, { recursive: true });
  const counter = ((testInfo as any)._shotCounter = ((testInfo as any)._shotCounter ?? 0) + 1);
  const slug = caption.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  const file = path.join(dir, `${String(counter).padStart(2, "0")}-${slug}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(caption, { path: file, contentType: "image/png" });
  return file;
}
