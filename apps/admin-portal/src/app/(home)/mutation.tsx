"use client";

import { api } from "~/trpc/react";

export default function Mutation({ pickupToken }: { pickupToken: string }) {
  const { mutate, data, isError, isSuccess } =
    api.auth.authenticateAuthorizedPickupToken.useMutation();

  return (
    <div>
      <button onClick={() => mutate({ pickupToken })}>
        Send encrypted token
      </button>
      {data && isSuccess ? "true" : "fals"}
    </div>
  );
}
