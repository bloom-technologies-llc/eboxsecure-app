import "./globals.css";

import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "EboxSecure | Secure Package Delivery Solutions",
  description:
    "Secure, convenient package delivery to warehouse locations that protect your packages from theft while providing earlier access and unlimited capacity for high-volume needs.",
  keywords: [
    "package delivery",
    "secure delivery",
    "warehouse delivery",
    "last-mile logistics",
    "package security",
    "B2B delivery",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
