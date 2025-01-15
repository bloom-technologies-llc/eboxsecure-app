"use client";

import { api } from "@/trpc/react";

export function OrdersList() {
  const data = api.order.getAllOrders.useQuery();
  return { data };
}
