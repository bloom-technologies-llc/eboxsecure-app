"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";

const SubscribeButton = ({
  lookupKey,
  actionVariant,
  disabled,
  actionText,
}: {
  lookupKey: string;
  actionVariant: "primary" | "outline";
  disabled: boolean;
  actionText: string;
}) => {
  const router = useRouter();
  const { mutate: subscribe } = api.subscription.subscribe.useMutation({
    onSuccess: (data) => {
      router.push(data.url);
    },
  });
  return (
    <>
      <input type="hidden" name="lookupKey" value={lookupKey} />
      <Button
        className="w-full"
        variant={actionVariant}
        disabled={disabled}
        onClick={() => subscribe({ lookupKey })}
      >
        {actionText}
      </Button>
    </>
  );
};

export default SubscribeButton;
