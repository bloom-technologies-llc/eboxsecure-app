"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { api } from "~/trpc/react";
import PackageTrackingTable from "../../_components/package-tracking-table";

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const {
    data: ordersData,
    isLoading,
    error,
  } = api.orders.getAllOrders.useQuery({
    page: currentPage,
    limit: pageSize,
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (error) {
    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <p className="my-4 font-medium">Orders</p>
            <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
              <div className="text-center">
                <p className="mb-2 text-red-600">Failed to load orders</p>
                <p className="text-sm text-gray-500">
                  {error.message || "An error occurred while fetching orders"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <p className="my-4 font-medium">Orders</p>
            <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading orders...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Orders</p>
          <PackageTrackingTable
            orders={ordersData?.orders || []}
            pagination={ordersData?.pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
}
