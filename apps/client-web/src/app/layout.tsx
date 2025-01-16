import type { Viewport } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@ebox/ui";

import "@/app/globals.css";

import Navbar from "@/components/navbar";

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
