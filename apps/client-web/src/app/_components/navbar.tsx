"use client";

import Image from "next/image";
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
      </nav>
    </header>
  );
}
