import TestMeterEvent from "@/components/test-meter-event";
import { api } from "@/trpc/server";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ebox/ui/tabs";

import OrderCard from "./OrderCard";

export default async function HomePage() {
  const orders = await api.order.getAllOrders();
  return (
    <main className="container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <div></div>
          <h2 className="mb-3 text-left text-2xl">Your orders</h2>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active orders</TabsTrigger>
              <TabsTrigger value="delivered">Delivered orders</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {orders.map((order) => (
                <OrderCard {...order} key={order.id.toString()} />
              ))}
            </TabsContent>
            <TabsContent value="delivered">Delivered</TabsContent>
          </Tabs>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-left text-2xl">Test Meter Events</h2>
          <TestMeterEvent />
        </div>
      </div>
    </main>
  );
}
