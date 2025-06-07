"use client";

/**
 * TODO: Re-enable this page when Twilio integration is fixed
 * This page is temporarily disabled but all backend logic is preserved
 */
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";

export default function Page() {
  // TODO: Remove this early return when Twilio integration is fixed
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Mobile Upload Temporarily Unavailable
        </h1>
        <p className="mb-6 text-gray-600">
          This feature is currently under maintenance. Please return to the main
          onboarding page to complete your setup using a webcam.
        </p>
        <Button
          onClick={() => router.push("/onboarding")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Return to Onboarding
        </Button>
      </div>
    </div>
  );

  // TODO: Uncomment all the code below when Twilio integration is fixed
  /*
  const router = useRouter();

  const { data } = api.onboarding.checkUploadStatus.useQuery(undefined, {
    refetchInterval: 2500,
  });

  if (data) {
    router.push("/");
  }

  return (
    <div className="flex w-[400px] flex-col items-center justify-center">
      <h1>
        Once you have successfully uploaded your photo on your phone, this page
        will redirect you to the next step.
      </h1>
    </div>
  );
  */
}
