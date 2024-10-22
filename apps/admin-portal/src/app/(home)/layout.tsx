import type { Viewport } from "next";

import Navbar from "../_components/navbar";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      {props.children}
    </>
  );
}
