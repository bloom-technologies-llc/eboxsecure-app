"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@ebox/ui/container";

const contactDetails = [
  {
    name: "Sales Team",
    email: "sales@eboxsecure.com",
    phone: "(317) 555-1234",
  },
  {
    name: "Customer Support",
    email: "support@eboxsecure.com",
    phone: "(317) 555-5678",
  },
  {
    name: "Partnership Inquiries",
    email: "partners@eboxsecure.com",
    phone: "(317) 555-9012",
  },
];

export function ContactInfo() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Contact Information
          </h2>
          <p className="mt-2 text-lg leading-8 text-muted-foreground">
            Our team is available to assist you during business hours.
          </p>

          <div className="mt-10 space-y-8">
            {contactDetails.map((contact) => (
              <div key={contact.name} className="flex gap-x-4">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {contact.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-primary"
                    >
                      {contact.email}
                    </a>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                      className="hover:text-primary"
                    >
                      {contact.phone}
                    </a>
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-x-4">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Business Hours
                </h3>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <li>Monday - Friday: 8:00 AM - 6:00 PM EST</li>
                  <li>Saturday: 9:00 AM - 1:00 PM EST</li>
                  <li>Sunday: Closed</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  Response time: Within 1 business day
                </p>
              </div>
            </div>

            <div className="flex gap-x-4">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Headquarters
                </h3>
                <address className="mt-1 text-sm not-italic text-muted-foreground">
                  123 Main Street
                  <br />
                  Carmel, IN 46032
                  <br />
                  United States
                </address>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-lg bg-muted/30 p-8">
            <h3 className="text-base font-semibold text-foreground">
              Location Map
            </h3>
            <div className="mt-4 aspect-video w-full rounded-md bg-muted">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Interactive map will be displayed here
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
