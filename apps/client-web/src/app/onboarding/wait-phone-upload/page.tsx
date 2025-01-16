"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export default function Page() {
  const router = useRouter();

  const { data } = api.onboarding.checkUploadStatus.useQuery(undefined, {
    refetchInterval: 2500,
  });

  if (data) {
    router.push("/");
  }

  return (
    <div>
      <h1>
        Once you have successfully uploaded your photo on your phone, this page
        will redirect you to the next step.
      </h1>
    </div>
  );
}
