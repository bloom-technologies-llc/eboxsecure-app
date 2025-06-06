import { api } from "~/trpc/server";
import PackageTrackingTable from "../../_components/package-tracking-table";

export default async function HomePage() {
  try {
    const orders = await api.orders.getAllOrders();

    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <p className="my-4 font-medium">Orders</p>
            <PackageTrackingTable orders={orders} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(error);
    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <p className="my-4 font-medium">Orders</p>
            <div>Access denied</div>
          </div>
        </div>
      </main>
    );
  }
}
