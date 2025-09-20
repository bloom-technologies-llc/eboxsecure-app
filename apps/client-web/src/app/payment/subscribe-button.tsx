"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";

const SubscribeButton = ({
  lookupKey,
  mostPopular,
  billingPeriod,
}: {
  lookupKey: string;
  mostPopular: boolean;
  billingPeriod: "month" | "year";
}) => {
  const router = useRouter();
  const { mutate: subscribe, data } = api.subscription.subscribe.useMutation({
    onSuccess: (data) => {
      router.push(data.url);
    },
  });

  const handleSubscribe = () => {
    const stripeLookupKey =
      billingPeriod === "month" ? lookupKey : `${lookupKey}_yearly`;
    subscribe({ lookupKey: stripeLookupKey });
  };
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
        onClick={() => handleSubscribe()}
      >
        Get Started
      </Button>
    </>
  );
};

export default SubscribeButton;
