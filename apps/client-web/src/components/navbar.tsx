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

  return (
    <header>
      <nav>
        <div className="flex justify-between px-32 py-4">
          <a href="/" className="flex items-center space-x-3">
            <Image src={logo} height={50} alt="EBoxSecure logo" />
            <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
              EboxSecure
            </span>
          </a>

          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex md:space-x-8">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Orders
              </Link>
              <Link
                href="/locations"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/locations")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Locations
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/settings")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Settings
              </Link>
            </nav>

            <div className="">
              <ul className="mt-4 flex  p-4 font-medium  md:mt-0  md:space-x-8 md:p-0">
                <li className="flex items-center">
                  <NotificationDropdown />
                </li>
                <li>
                  <a href="#">
                    <UserButton />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
