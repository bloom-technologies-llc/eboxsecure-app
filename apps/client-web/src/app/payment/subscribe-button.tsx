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
  const {
    mutate: subscribe,
    isPending,
    isSuccess,
    error,
  } = api.subscription.subscribe.useMutation({
    onSuccess: (data) => {
      router.push(data.url);
    },
  });

  // Stay disabled after success while the browser navigates to Stripe Checkout.
  const isBusy = isPending || isSuccess;

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
        disabled={isBusy}
        className={`w-full ${
          mostPopular
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-900 hover:bg-gray-800"
        }`}
        onClick={() => handleSubscribe()}
      >
        {isBusy ? "Redirecting to checkout..." : "Get Started"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-600">
          We couldn&apos;t start checkout. Please try again.
        </p>
      )}
    </>
  );
};

export default SubscribeButton;
