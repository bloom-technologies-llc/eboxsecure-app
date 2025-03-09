"use client";

import type { Viewport } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@ebox/ui";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import Navbar from "./_components/navbar";
import AppSidebar from "./_components/sidebar";
import { SidebarProvider, SidebarTrigger } from "./_components/ui/sidebar";

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
          {/* <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn> */}
          <div className="[--header-height:calc(theme(spacing.14))]">
            <SidebarProvider className="flex flex-col">
              <Navbar />
              <div className="flex flex-1">
                <AppSidebar />
                {/* <SidebarTrigger /> */}
                <TRPCReactProvider>{props.children}</TRPCReactProvider>
              </div>
            </SidebarProvider>
          </div>

          {/* </ThemeProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
