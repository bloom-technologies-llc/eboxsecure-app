"use client";

import { api } from "../../../trpc/react";
import CommentForm from "./CommentForm";

interface CommentsContainerProps {
  orderId: number;
  locationId: number;
}

export default function CommentsContainer({
  orderId,
  locationId,
}: CommentsContainerProps) {
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
