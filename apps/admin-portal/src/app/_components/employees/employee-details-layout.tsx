"use client";

import { ReactNode } from "react";

interface EmployeeDetailsLayoutProps {
  header: ReactNode;
  detailPanels: ReactNode;
  children: ReactNode;
}

export default function EmployeeDetailsLayout({
  header,
  detailPanels,
  children,
}: EmployeeDetailsLayoutProps) {
  return (
    <main className="bg-pageBackground w-full">
      <div className="container w-full px-4 py-16 sm:px-8 md:w-11/12">
        {header}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Comments section */}
          <div className="flex min-w-0 flex-col gap-y-2 lg:col-span-2">
            {children}
          </div>

          {/* Details section */}
          <div className="flex min-w-0 flex-col gap-y-6">{detailPanels}</div>
        </div>
      </div>
    </main>
  );
}
