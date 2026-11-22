import { defineConfig } from "@playwright/test";

const stamp = process.env.E2E_RUN_ID ?? "local";

export default defineConfig({
  testDir: "./tests",
  outputDir: `./artifacts/${stamp}/results`,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: `./artifacts/${stamp}/report.json` }],
    ["html", { outputFolder: `./artifacts/${stamp}/html`, open: "never" }],
  ],
  use: {
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    video: "on",
    trace: "on",
    screenshot: "on",
    launchOptions: {
      args: [
        // Feed a synthetic webcam so the onboarding portrait step can run unattended.
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
    permissions: ["camera"],
  },
});
