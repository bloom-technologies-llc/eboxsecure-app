import Image from "next/image";
import Link from "next/link";
import logo from "public/eboxsecure-logo.png";

import { Container } from "@ebox/ui/container";

import { LinkedIn, Twitter } from "../icons";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "For Customers", href: "/for-customers" },
    { name: "For Businesses", href: "/for-businesses" },
    { name: "Integration", href: "/integration" },
    { name: "Partners", href: "/partners" },
    { name: "Locations", href: "/locations" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
  social: [
    {
      name: "LinkedIn",
      href: "#",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <LinkedIn className="h-6 w-6" aria-hidden="true" />
      ),
    },
    {
      name: "Twitter",
      href: "#",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <Twitter className="h-6 w-6" aria-hidden="true" />
      ),
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <Container className="py-12 md:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image src={logo} alt="EboxSecure Logo" width={80} />
              <span className="text-2xl font-bold text-primary">
                EboxSecure
              </span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              Secure, convenient package delivery to warehouse locations that
              protect your packages from theft.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Navigation
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.main.slice(0, 4).map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Resources
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.main.slice(4).map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Contact
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <p className="text-sm leading-6 text-muted-foreground">
                      123 Main Street
                      <br />
                      Carmel, IN 46032
                    </p>
                  </li>
                  <li>
                    <a
                      href="mailto:info@eboxsecure.com"
                      className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                    >
                      info@eboxsecure.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+13175551234"
                      className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                    >
                      (317) 555-1234
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} EboxSecure, Inc. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
