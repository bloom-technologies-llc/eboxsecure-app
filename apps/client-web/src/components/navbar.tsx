"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import logo from "public/logo.png";

import NotificationDropdown from "./notification-dropdown";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.includes("sign-in") || pathname.includes("sign-up")) {
    return <></>;
  }

  const links = [
    { href: "/", label: "Orders", active: pathname === "/" },
    {
      href: "/locations",
      label: "Locations",
      active: pathname.startsWith("/locations"),
    },
    {
      href: "/settings",
      label: "Settings",
      active: pathname.startsWith("/settings"),
    },
  ];
  const linkClass = (active: boolean) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <header>
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-32">
        <a href="/" className="flex min-w-0 items-center space-x-3">
          <Image src={logo} height={50} alt="EBoxSecure logo" />
          <span className="self-center truncate whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl">
            EboxSecure
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-4 md:gap-8">
          <nav
            aria-label="Main"
            className="hidden md:flex md:items-center md:space-x-8"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.active)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <NotificationDropdown />
          <UserButton />
        </div>
      </div>

      {/* Phone-width navigation: the same links in a row under the header. */}
      <nav
        aria-label="Main"
        className="flex justify-center gap-8 border-y bg-background/60 px-4 py-2 md:hidden"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(link.active)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
