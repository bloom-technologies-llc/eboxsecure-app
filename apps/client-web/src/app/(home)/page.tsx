import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ebox/ui/tabs";

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

  {
    date_ordered: "Aug. 5, 2024",
    total: 67.45,
    ship_to: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    order_number: "#08703425-24628",
  },
];
export default function HomePage() {
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
                <OrderCard {...order} />
              ))}
            </TabsContent>
            <TabsContent value="delivered">Delivered</TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
