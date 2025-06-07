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
      <div className="container w-full py-16 md:w-11/12">
        {header}
        <div className="grid grid-cols-3 gap-x-6">
          {/* Comments section */}
          <div className="col-span-2 flex flex-col gap-y-2">{children}</div>

          {/* Details section */}
          <div className="flex w-fit flex-col gap-y-6">{detailPanels}</div>
        </div>
      </div>
    </main>
  );
}
