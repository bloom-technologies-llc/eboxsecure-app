"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";

const SubscribeButton = ({
  lookupKey,
  mostPopular,
}: {
  lookupKey: string;
  mostPopular: boolean;
}) => {
  const router = useRouter();
  const { mutate: subscribe, data } = api.subscription.subscribe.useMutation({
    onSuccess: (data) => {
      router.push(data.url);
    },
  });

  return (
    <>
      <input type="hidden" name="lookupKey" value={lookupKey} />
      <Button
        type="submit"
        className={`w-full ${
          mostPopular
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-900 hover:bg-gray-800"
        }`}
        onClick={() => subscribe({ lookupKey })}
      >
        Get Started
      </Button>
    </>
  );
};

export default SubscribeButton;
