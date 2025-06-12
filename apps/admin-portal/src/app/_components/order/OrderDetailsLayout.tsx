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
      <div className="container w-full py-16 md:w-11/12">
        {header}

        <div className="grid grid-cols-3 gap-x-6">
          {/* Main content area */}
          <div className="col-span-2 flex flex-col gap-y-2">{children}</div>
          {/* Detail panels area */}
          {detailPanels}
        </div>
      </div>
    </main>
  );
}
