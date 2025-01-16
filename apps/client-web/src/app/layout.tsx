import type { Viewport } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@ebox/ui";

import "@/app/globals.css";

import Navbar from "@/components/navbar";

// TODO: update
// export const metadata: Metadata = {
//   metadataBase: new URL(
//     process.env.VERCEL_ENV === "production"
//       ? "https://turbo.t3.gg"
//       : "http://localhost:3000",
//   ),
//   title: "Create T3 Turbo",
//   description: "Simple monorepo with shared backend for web & mobile apps",
//   openGraph: {
//     title: "Create T3 Turbo",
//     description: "Simple monorepo with shared backend for web & mobile apps",
//     url: "https://create-t3-turbo.vercel.app",
//     siteName: "Create T3 Turbo",
//   },
//   twitter: {
//     card: "summary_large_image",
//     site: "@jullerino",
//     creator: "@jullerino",
//   },
// };

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans text-foreground antialiased",
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          <TRPCReactProvider>
            <Navbar />
            {props.children}
          </TRPCReactProvider>
          {/* </ThemeProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
