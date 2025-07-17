"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";

import { Button } from "@ebox/ui/button";

import PickupQRScanner from "./scanner";

export default function PickupQRScannerButton() {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsQRScannerOpen(true)}
        className="relative flex items-center gap-2 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
      >
        <QrCode className="h-4 w-4" />
        Scan pickup
      </Button>

      <PickupQRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </>
  );
}
