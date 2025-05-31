"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

import { Container } from "../ui/container";

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

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">
                EboxSecure
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:gap-x-6 lg:gap-x-8">
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
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">
                  EboxSecure
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-200">
                <div className="space-y-2 py-6">
                  {/* Simple links */}
                  {navigation
                    .filter((item) => !item.dropdown)
                    .map((item) => (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}

                  {/* Dropdown categories */}
                  {navigation
                    .filter((item) => item.dropdown)
                    .map((category) => (
                      <div key={category.name} className="space-y-1 py-2">
                        <div className="-mx-3 border-b border-gray-100 px-3 py-2 text-base font-semibold leading-7 text-foreground">
                          {category.name}
                        </div>
                        <div className="space-y-1 pl-4 pt-1">
                          {category.items?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="-mx-3 block rounded-lg px-3 py-2 text-sm font-medium leading-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="space-y-3 py-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="https://app.eboxsecure.com">Go to app</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
