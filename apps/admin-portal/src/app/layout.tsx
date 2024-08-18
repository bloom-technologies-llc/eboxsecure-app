import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@ebox/ui";
import { ThemeProvider, ThemeToggle } from "@ebox/ui/theme";
import { Toaster } from "@ebox/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import Navbar from "./_components/navbar";

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
            <header>
              <Navbar />
            </header>
            {props.children}
          </TRPCReactProvider>
          <Toaster />
          {/* </ThemeProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
