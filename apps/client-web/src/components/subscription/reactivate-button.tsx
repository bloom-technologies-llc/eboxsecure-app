"use client";

import { useState } from "react";
import { reactivateSubscription } from "@/lib/subscription-actions";

import { Button } from "@ebox/ui/button";

export function ReactivateButton() {
  const [reactivating, setReactivating] = useState(false);

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      await reactivateSubscription();
      // Refresh the page to show updated subscription status
      window.location.reload();
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
