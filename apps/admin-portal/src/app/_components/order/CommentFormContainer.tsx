"use client";

import { api } from "../../../trpc/react";
import CommentForm from "./CommentForm";

interface CommentFormContainerProps {
  orderId: number;
  locationId: number;
}

export default function CommentFormContainer({
  orderId,
  locationId,
}: CommentFormContainerProps) {
  const { data: locationEmployees } =
    api.orderComments.getLocationEmployees.useQuery({
      locationId: locationId,
    });

  return (
    <CommentForm
      orderId={orderId}
      locationId={locationId}
      locationEmployees={locationEmployees || []}
    />
  );
}
