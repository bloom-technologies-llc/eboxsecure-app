"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reactivateSubscription } from "@/actions";

import { Button } from "@ebox/ui/button";

export function ReactivateButton() {
  const [reactivating, setReactivating] = useState(false);
  const router = useRouter();

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      await reactivateSubscription();
      router.refresh();
    } catch (error) {
      console.error("Reactivation failed:", error);
    } finally {
      setReactivating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleReactivate}
      disabled={reactivating}
    >
      {reactivating ? "Reactivating..." : "Reactivate"}
    </Button>
  );
}
