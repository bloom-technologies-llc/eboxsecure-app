import VirtualAddressBanner from "@/components/VirtualAddressBanner";
import { api } from "@/trpc/server";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ebox/ui/tabs";

import OrderCard from "./OrderCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { order?: string };
}) {
  const orders = await api.order.getAllOrders();

  const pickedUpOrders = orders.filter((order) => order.pickedUpAt);
  const notPickedUpOrders = orders.filter((order) => !order.pickedUpAt);

  // `/?order=<id>` (used by notification links) opens the tab holding that
  // order and highlights its card.
  const highlightedOrderId = Number(searchParams?.order);
  const highlightedIsPickedUp = pickedUpOrders.some(
    (order) => order.id === highlightedOrderId,
  );
  return (
    <main className="container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <div></div>
          <h2 className="mb-3 text-left text-2xl">Your orders</h2>
          <VirtualAddressBanner />
          <Tabs
            key={highlightedIsPickedUp ? "picked-up" : "active"}
            defaultValue={highlightedIsPickedUp ? "delivered" : "active"}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="active">Active orders</TabsTrigger>
              <TabsTrigger value="delivered">Picked up orders</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {notPickedUpOrders.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  You have no active orders. Orders shipped to your EboxSecure
                  location will appear here.
                </p>
              )}
              {notPickedUpOrders.map((order) => (
                <OrderCard
                  {...order}
                  highlighted={order.id === highlightedOrderId}
                  key={order.id.toString()}
                />
              ))}
            </TabsContent>
            <TabsContent value="delivered">
              {pickedUpOrders.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  You have not picked up any orders yet.
                </p>
              )}
              {pickedUpOrders.map((order) => (
                <OrderCard
                  {...order}
                  highlighted={order.id === highlightedOrderId}
                  key={order.id.toString()}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
