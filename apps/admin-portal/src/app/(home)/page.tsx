import { api } from "~/trpc/server";

export default async function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  const orders = await api.order.getAllOrders();

  return (
    <main className="container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          Home page
          <br />
          {orders.map((order) => order.vendorOrderId)}
        </div>
      </div>
    </main>
  );
}
