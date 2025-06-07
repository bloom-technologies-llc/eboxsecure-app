import { notFound } from "next/navigation";
import { UserType } from "@prisma/client";

import CarriersTable from "~/app/_components/carriers-table";
import { api } from "~/trpc/server";

export default async function CarriersPage() {
  try {
    // Check if user is corporate - this will throw if not authorized
    const userType = await api.user.getUserType();

    if (userType !== UserType.CORPORATE) {
      notFound();
    }

    const carriers = await api.carriers.getAllCarriers();

    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="my-4 flex items-center justify-between">
              <p className="font-medium">Carriers</p>
            </div>
            <CarriersTable carriers={carriers} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <p className="my-4 font-medium">Carriers</p>
            <div className="text-center text-red-500">
              Access denied or error loading carriers
            </div>
          </div>
        </div>
      </main>
    );
  }
}
