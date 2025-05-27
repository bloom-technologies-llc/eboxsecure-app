// TODO: fix to allow @ebox namespace
import { api } from "../../../../../trpc/server";
import OrderDetailsClient from "./OrderDetailsClient";

interface OrderDetailProps {
  params: {
    orderId: string;
  };
}

export default async function OrderDetail({ params }: OrderDetailProps) {
  const { orderId } = params;
  try {
    const orderDetails = await api.orders.getOrderDetails({
      orderId: parseInt(orderId),
    });

    return <OrderDetailsClient orderDetails={orderDetails} />;
  } catch (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Order not available</h1>
      </div>
    );
  }
}
