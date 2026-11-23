import { readFileSync } from "node:fs";
import { test } from "@playwright/test";

import { ADMIN_URL, CLIENT_URL } from "../lib/env";

const MARKETING =
  process.env.MARKETING_URL ??
  "https://eboxsecure-app-marketing-site-9cttin708-bloom-technologies.vercel.app";
const orders = JSON.parse(readFileSync(".auth/orders-state.json", "utf8"));
test.use({ video: "off", trace: "off" });
const VIEWPORTS = process.env.E2E_VIEWPORTS === "desktop" ? [{ name: "desktop-1440", width: 1440, height: 900 }] : [
  { name: "phone-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
];
const ENGINE = process.env.E2E_BROWSER ?? "chrome";
const SUITES: {
  key: string;
  base: string;
  storage?: string;
  pages: string[];
}[] = [
  {
    key: "marketing",
    base: MARKETING,
    pages: [
      "/",
      "/for-customers",
      "/for-businesses",
      "/partners",
      "/pricing",
      "/contact",
      "/about",
      "/faq",
      "/locations",
      "/integration",
      "/privacy",
      "/terms",
    ],
  },
  {
    key: "customer",
    base: CLIENT_URL,
    storage: ".auth/customer-a.json",
    pages: [
      "/",
      "/locations",
      "/locations/2",
      "/settings",
      "/settings/usage",
      "/settings/notifications",
      "/settings/trusted-contacts",
      "/settings/billing",
      "/settings/subscription",
    ],
  },
  {
    key: "admin-corporate",
    base: ADMIN_URL,
    storage: ".auth/admin-corporate.json",
    pages: [
      "/",
      "/orders",
      `/orders/order-details/${orders.order1}`,
      "/employees",
      "/carriers",
      "/locations",
      "/locations/2",
      "/customers",
    ],
  },
  {
    key: "admin-associate",
    base: ADMIN_URL,
    storage: ".auth/admin-associateA.json",
    pages: ["/", "/orders", "/customers"],
  },
  { key: "auth", base: CLIENT_URL, pages: ["/sign-in", "/sign-up"] },
];

for (const vp of VIEWPORTS) {
  for (const suite of SUITES) {
    test.describe(`${vp.name} ${suite.key}`, () => {
      test.use({
        viewport: { width: vp.width, height: vp.height },
        ...(suite.storage ? { storageState: suite.storage } : {}),
      });
      test(`RESP ${vp.name} ${suite.key}`, async ({ page }) => {
        test.setTimeout(240_000);
        for (const p of suite.pages) {
          await page.goto(suite.base + p, { waitUntil: "domcontentloaded" });
          await page.waitForLoadState("networkidle").catch(() => {});
          await page.waitForTimeout(1500);
          const file = `artifacts/${process.env.E2E_RUN_ID}/responsive/${ENGINE}-${vp.name}/${suite.key}${p.replace(/\//g, "_") || "_home"}.png`;
          await page.screenshot({ path: file, fullPage: true });
          const report = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const overflow = document.documentElement.scrollWidth - vw;
            const offenders: string[] = [];
            document.querySelectorAll("body *").forEach((el) => {
              const r = (el as HTMLElement).getBoundingClientRect();
              if (r.width === 0 || r.height === 0) return;
              const style = getComputedStyle(el as HTMLElement);
              if (style.position === "fixed" && r.right <= vw + 1) return;
              if (r.right > vw + 2 || r.left < -2) {
                // ignore things inside a horizontally scrollable container
                let a: HTMLElement | null = (el as HTMLElement).parentElement;
                let scrollable = false;
                while (a) {
                  const s = getComputedStyle(a);
                  if (
                    /(auto|scroll|hidden)/.test(s.overflowX) &&
                    a !== document.body &&
                    a !== document.documentElement
                  ) {
                    scrollable = true;
                    break;
                  }
                  a = a.parentElement;
                }
                if (!scrollable && offenders.length < 4)
                  offenders.push(
                    `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 40)} [${Math.round(r.left)}..${Math.round(r.right)}] "${((el as HTMLElement).innerText || "").slice(0, 30).replace(/\s+/g, " ")}"`,
                  );
              }
            });
            return { vw, overflow, offenders };
          });
          console.log(
            `RESP|${vp.name}|${suite.key}|${p}|overflow=${report.overflow}|${report.offenders.join(" ;; ")}`,
          );
        }
      });
    });
  }
}
