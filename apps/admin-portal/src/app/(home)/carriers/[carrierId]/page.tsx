import { notFound } from "next/navigation";
import { UserType } from "@prisma/client";

import CarrierHeader from "~/app/_components/carriers/carrier-header";
import CarrierMetricsCards from "~/app/_components/carriers/carrier-metrics-cards";
import CarrierOrdersTable from "~/app/_components/carriers/carrier-orders-table";
import { api } from "~/trpc/server";

interface CarrierDetailProps {
  params: {
    carrierId: string;
  };
}

export default async function CarrierDetail({ params }: CarrierDetailProps) {
  const { carrierId } = params;

  try {
    // Check if user is corporate - this will throw if not authorized
    const userType = await api.user.getUserType();

    if (userType !== UserType.CORPORATE) {
      notFound();
    }

    const [carrierDetails, carrierMetrics] = await Promise.all([
      api.carriers.getCarrierDetails({
        carrierId: parseInt(carrierId),
      }),
      api.carriers.getCarrierMetrics({
        carrierId: parseInt(carrierId),
      }),
    ]);

    if (!carrierDetails) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <h1>Carrier not found</h1>
        </div>
      );
    }

    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="my-6 flex items-center gap-x-2">
              <CarrierHeader carrier={carrierDetails} />
            </div>

            <div className="mb-6">
              <CarrierMetricsCards metrics={carrierMetrics} />
            </div>

            <div className="w-full">
              <h2 className="mb-4 text-lg font-semibold">Order History</h2>
              <CarrierOrdersTable orders={carrierDetails.orders} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Carrier not available or access denied</h1>
      </div>
    );
  }
}
