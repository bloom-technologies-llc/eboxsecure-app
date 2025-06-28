"use client";

import { useState } from "react";

import { Button } from "@ebox/ui/button";

import { CancellationModal } from "./cancellation-modal";

interface CancelButtonProps {
  currentPlanName: string;
  currentPeriodEnd: number;
}

export function CancelButton({
  currentPlanName,
  currentPeriodEnd,
}: CancelButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    // Refresh the page to show updated subscription status
    window.location.reload();
  };

  return (
    <>
      <Button
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => setShowModal(true)}
      >
        Cancel Plan
      </Button>

      <CancellationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        currentPlanName={currentPlanName}
        currentPeriodEnd={currentPeriodEnd}
      />
    </>
  );
}
