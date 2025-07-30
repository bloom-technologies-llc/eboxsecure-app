"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";

const ManageBilling = () => {
  const router = useRouter();
  const { mutate: createBillingPortalSession } =
    api.subscription.createBillingPortalSession.useMutation({
      onSuccess: (data) => {
        router.push(data.url);
      },
    });
  return (
    <Button
      variant="outline"
      type="submit"
      onClick={() => createBillingPortalSession()}
    >
      Manage Billing
    </Button>
  );
};

export default ManageBilling;
