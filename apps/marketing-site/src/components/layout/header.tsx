"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import logo from "public/eboxsecure-logo.png";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

// Reorganized navigation with dropdown categories
const navigation = [
  { name: "Home", href: "/" },
  {
    name: "About",
    href: "/about",
    dropdown: false,
  },
  {
    name: "Solutions",
    dropdown: true,
    items: [
      { name: "For Customers", href: "/for-customers" },
      { name: "For Businesses", href: "/for-businesses" },
      { name: "Integration", href: "/integration" },
    ],
  },
  {
    name: "Resources",
    dropdown: true,
    items: [
      { name: "Partners", href: "/partners" },
      { name: "Locations", href: "/locations" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    name: "Pricing",
    href: "/pricing",
    dropdown: false,
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<
    string | null
  >(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeDropdown) {
        const currentRef = dropdownRefs.current[activeDropdown];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Add this effect to prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const toggleMobileDropdown = (name: string) => {
    setActiveMobileDropdown(activeMobileDropdown === name ? null : name);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveMobileDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src={logo} alt="EboxSecure Logo" width={80} />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center md:flex md:gap-x-6 lg:gap-x-8">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                ref={(el) => {
                  dropdownRefs.current[item.name] = el;
                }}
                onMouseEnter={() =>
                  item.dropdown && setActiveDropdown(item.name)
                }
                onClick={() => item.dropdown && setActiveDropdown(item.name)}
              >
                {item.dropdown ? (
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      aria-expanded={activeDropdown === item.name}
                      aria-haspopup="true"
                    >
                      {item.name}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? "rotate-180" : ""}`}
                      />
                    </button>
                    {activeDropdown === item.name && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-56 origin-top-left rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in-10 slide-in-from-top-5 focus:outline-none">
                        <div className="py-2">
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden md:flex md:items-center md:gap-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/contact">Contact Sales</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="https://app.eboxsecure.com">Go to app</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu overlay - improved backdrop coverage */}
      {mobileMenuOpen && (
        <>
          {/* Full viewport backdrop with blur */}
          <div
            className="fixed inset-0 z-40 h-[100vh] bg-background/80 backdrop-blur-md md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Mobile menu panel */}
          <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background/95 shadow-lg backdrop-blur-sm duration-200 animate-in slide-in-from-top-2 md:hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-6">
                {/* Navigation items */}
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.dropdown ? (
                        <div>
                          <button
                            onClick={() => toggleMobileDropdown(item.name)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                            aria-expanded={activeMobileDropdown === item.name}
                          >
                            {item.name}
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-200 ${
                                activeMobileDropdown === item.name
                                  ? "rotate-180"
                                  : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          {activeMobileDropdown === item.name && (
                            <div className="mt-1 space-y-1 duration-200 animate-in slide-in-from-top-1">
                              {item.items?.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="block rounded-lg py-2 pl-6 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  onClick={closeMobileMenu}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className="block rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-border" />

                {/* Mobile CTA buttons */}
                <div className="space-y-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Link href="/contact" onClick={closeMobileMenu}>
                      Contact Sales
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-center">
                    <Link
                      href="https://app.eboxsecure.com"
                      onClick={closeMobileMenu}
                    >
                      Go to app
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
