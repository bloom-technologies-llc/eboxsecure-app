import { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ebox/ui/tabs";

import { api } from "~/trpc/server";
import OrderCard from "./order-card";

const orders = [
  {
    date_ordered: "March 30, 2024",
    total: 430.0,
    ship_to: "42 Wallaby Way, Sydney, Australia",
    order_number: "#10346943-20789",
  },
  {
    date_ordered: "Aug. 5, 2024",
    total: 67.45,
    ship_to: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    order_number: "#08703425-24628",
  },
];
export default function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  const posts = api.order.getAllOrders();

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-full">
          <h2 className="text-left text-2xl">Your orders</h2>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active orders</TabsTrigger>
              <TabsTrigger value="delivered">Delivered orders</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {orders.map((order) => (
                <OrderCard {...order} />
              ))}
            </TabsContent>
            <TabsContent value="delivered">Delivered</TabsContent>
          </Tabs>
          <Suspense fallback={<>hello</>}>
            {/* {posts.map((post) => <p>{post}</p>)} */}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
