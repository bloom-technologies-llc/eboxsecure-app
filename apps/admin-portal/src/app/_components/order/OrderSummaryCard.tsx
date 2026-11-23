interface OrderSummaryCardProps {
  order: {
    id: number;
    vendorOrderId: string;
    trackingNumber: string | null;
    sourceChannel: string;
    total: number;
    createdAt: Date;
    deliveredDate: Date | null;
    pickedUpAt: Date | null;
    cancelledAt: Date | null;
    shippedLocation: { name: string; address: string };
  };
}

function orderStatus(order: OrderSummaryCardProps["order"]) {
  if (order.cancelledAt)
    return { label: "Cancelled", className: "bg-red-100 text-red-800" };
  if (order.pickedUpAt)
    return { label: "Picked up", className: "bg-green-100 text-green-800" };
  if (order.deliveredDate)
    return {
      label: "Ready for pickup",
      className: "bg-yellow-100 text-yellow-800",
    };
  return { label: "Ordered", className: "bg-blue-100 text-blue-800" };
}

const formatDate = (date: Date | null) => (date ? date.toLocaleString() : "—");

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const status = orderStatus(order);
  const rows: [string, string][] = [
    [
      "Order number",
      order.vendorOrderId.startsWith("DEFAULT_") ? "—" : order.vendorOrderId,
    ],
    ["Tracking number", order.trackingNumber ?? "—"],
    ["Source", order.sourceChannel === "SHOPIFY" ? "Shopify" : "Package scan"],
    ["Total", order.total === -1 ? "N/A" : `$${order.total.toFixed(2)}`],
    ["Location", order.shippedLocation.name],
    ["Address", order.shippedLocation.address],
    ["Order created", formatDate(order.createdAt)],
    ["Delivered to location", formatDate(order.deliveredDate)],
    ["Picked up", formatDate(order.pickedUpAt)],
    ...(order.cancelledAt
      ? ([["Cancelled", formatDate(order.cancelledAt)]] as [string, string][])
      : []),
  ];

  return (
    <div className="rounded-lg border border-border bg-white px-6 py-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium">Order details</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-gray-500">{label}</dt>
            <dd className="break-words font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
