import type { Viewport } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

import { cn } from "@ebox/ui";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { SidebarProvider, SidebarTrigger } from "@ebox/ui/sidebar";
import { Toaster } from "@ebox/ui/toaster";
import { TooltipProvider } from "@ebox/ui/tooltip";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={cn(
              "min-h-screen bg-background font-sans text-foreground antialiased",
              GeistSans.variable,
              GeistMono.variable,
            )}
          >
            <div className="[--header-height:calc(theme(spacing.14))]">
              <SidebarProvider className="flex flex-col">
                <Toaster />
                <TooltipProvider delayDuration={100}>
                  <div className="flex flex-1">{props.children}</div>
                </TooltipProvider>
              </SidebarProvider>
            </div>
          </body>
        </html>
      </ClerkProvider>
    </TRPCReactProvider>
  );
}
