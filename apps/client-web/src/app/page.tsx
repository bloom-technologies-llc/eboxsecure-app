import { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ebox/ui/tabs";

// import { api } from "~/trpc/server";

export default function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  // const posts = api.order.getAllOrders();

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-1/2">
          <h2 className="text-left text-2xl">Your orders</h2>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active orders</TabsTrigger>
              <TabsTrigger value="delivered">Delivered orders</TabsTrigger>
            </TabsList>
            <TabsContent value="active">Active</TabsContent>
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
