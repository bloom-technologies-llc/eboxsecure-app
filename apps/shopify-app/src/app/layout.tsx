import type { ReactNode } from "react";

export const metadata = {
  title: "EboxSecure",
  description: "EboxSecure Shopify app",
};

/**
 * Minimal root layout required by the App Router so the embedded status page
 * (`page.tsx`) can render. The app's only HTML surface is that one page — every
 * other route is a JSON/redirect route handler — so this is deliberately bare.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
