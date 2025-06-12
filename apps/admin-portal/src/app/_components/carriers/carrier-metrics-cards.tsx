import { Clock, Package, PackageCheck, Truck } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";

type CarrierMetrics = RouterOutputs["carriers"]["getCarrierMetrics"];

interface CarrierMetricsCardsProps {
  metrics: CarrierMetrics;
}

export default function CarrierMetricsCards({
  metrics,
}: CarrierMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            All orders handled by this carrier
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.ordersInTransit}</div>
          <p className="text-xs text-muted-foreground">
            Orders currently being delivered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.ordersDelivered}</div>
          <p className="text-xs text-muted-foreground">
            Successfully delivered orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Delivery Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.averageDeliveryTime > 0
              ? `${metrics.averageDeliveryTime}d`
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            Average days from order to delivery
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
