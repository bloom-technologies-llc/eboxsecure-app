import { ReactNode } from "react";

interface OrderDetailsLayoutProps {
  children: ReactNode;
  detailPanels: ReactNode;
  header: ReactNode;
}

export default function OrderDetailsLayout({
  children,
  detailPanels,
  header,
}: OrderDetailsLayoutProps) {
  return (
    <main className="bg-pageBackground w-full">
      <div className="container w-full px-4 py-16 sm:px-8 md:w-11/12">
        {header}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content area */}
          <div className="flex min-w-0 flex-col gap-y-2 lg:col-span-2">
            {children}
          </div>
          {/* Detail panels area */}
          {detailPanels}
        </div>
      </div>
    </main>
  );
}
