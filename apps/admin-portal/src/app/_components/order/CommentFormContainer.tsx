import { api } from "../../../trpc/server";
import CommentForm from "./CommentForm";

interface CommentFormContainerProps {
  orderId: number;
  locationId: number;
}

export default async function CommentFormContainer({
  orderId,
  locationId,
}: CommentFormContainerProps) {
  const locationEmployees = await api.orderComments.getLocationEmployees({
    locationId: locationId,
  });

  return (
    <CommentForm
      orderId={orderId}
      locationEmployees={locationEmployees || []}
    />
  );
}
