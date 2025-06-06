// TODO: fix to allow @ebox namespace

import BackButton from "../../../../_components/order/BackButton";
import CommentFormContainer from "../../../../_components/order/CommentFormContainer";
import CommentsSection from "../../../../_components/order/CommentsSection";
import CustomerDetailsCard from "../../../../_components/order/CustomerDetailsCard";
import OrderDetailsLayout from "../../../../_components/order/OrderDetailsLayout";
import { api } from "../../../../../trpc/server";

interface OrderDetailProps {
  params: {
    orderId: string;
  };
  searchParams: {
    highlight?: string;
  };
}

export default async function OrderDetail({
  params,
  searchParams,
}: OrderDetailProps) {
  const { orderId } = params;
  const highlightedCommentId = searchParams.highlight || null;

  try {
    const [orderDetails, orderComments] = await Promise.all([
      api.orders.getOrderDetails({
        orderId: parseInt(orderId),
      }),
      api.orderComments.queryOrderComments({
        orderId: parseInt(orderId),
      }),
    ]);

    return (
      <OrderDetailsLayout
        header={
          <div className="my-6 flex items-center gap-x-2">
            <BackButton orderId={orderDetails.id} />
          </div>
        }
        detailPanels={<CustomerDetailsCard customer={orderDetails.customer} />}
      >
        <div className="flex flex-col gap-y-6">
          <CommentFormContainer
            orderId={orderDetails.id}
            locationId={orderDetails.shippedLocation.id}
          />

          <CommentsSection
            comments={orderComments || []}
            highlightedCommentId={highlightedCommentId}
          />
        </div>
      </OrderDetailsLayout>
    );
  } catch (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Order not available</h1>
      </div>
    );
  }
}
