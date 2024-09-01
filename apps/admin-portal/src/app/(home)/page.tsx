import { api } from "~/trpc/server";
import Mutation from "./mutation";

export default async function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  const token = await api.auth.getAuthorizedPickupToken({ orderId: 123 });
  return (
    <main className="container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          Home page
          <br />
          {token}
          <Mutation pickupToken={token} />
        </div>
      </div>
    </main>
  );
}
