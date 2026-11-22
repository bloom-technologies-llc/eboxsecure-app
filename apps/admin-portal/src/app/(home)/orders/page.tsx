"use client";

import { useEffect, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";

import type {
  OrderSortDirection,
  OrderSortField,
  OrderStatusFilter,
} from "../../_components/package-tracking-table";
import { api } from "~/trpc/react";
import PackageTrackingTable from "../../_components/package-tracking-table";

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<OrderStatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<OrderSortField>("date");
  const [sortDirection, setSortDirection] =
    useState<OrderSortDirection>("desc");

  // Debounce typing so we don't query on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const {
    data: ordersData,
    isLoading,
    isFetching,
    error,
  } = api.orders.getAllOrders.useQuery(
    {
      page: currentPage,
      limit: PAGE_SIZE,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
      sortBy,
      sortDirection,
    },
    { placeholderData: keepPreviousData },
  );

  return (
    <main className="container min-h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Orders</p>
          <PackageTrackingTable
            orders={ordersData?.orders ?? []}
            pagination={ordersData?.pagination}
            isLoading={isLoading}
            isFetching={isFetching}
            errorMessage={
              error
                ? error.message || "An error occurred while fetching orders"
                : undefined
            }
            status={status}
            onStatusChange={(next) => {
              setStatus(next);
              setCurrentPage(1);
            }}
            search={searchInput}
            onSearchChange={setSearchInput}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={(field, direction) => {
              setSortBy(field);
              setSortDirection(direction);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
}
