"use client";

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

import Navbar from "./_components/navbar";
import AppSidebar from "./_components/sidebar";

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
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              <div className="[--header-height:calc(theme(spacing.14))]">
                <SidebarProvider className="flex flex-col">
                  <div className="flex flex-1">{props.children}</div>
                </SidebarProvider>
              </div>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </TRPCReactProvider>
  );
}
