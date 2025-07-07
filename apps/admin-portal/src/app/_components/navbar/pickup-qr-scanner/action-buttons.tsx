import { Button } from "@ebox/ui/button";

interface ActionButtonsProps {
  onCancel: () => void;
  onScanQR: () => void;
  onConfirmPickup: () => void;
  showScanButton: boolean;
  scanningDisabled: boolean;
  processingPickup: boolean;
  qrCodeInput: string;
}

// Action Buttons Component
export default function ActionButtons({
  onCancel,
  onScanQR,
  onConfirmPickup,
  showScanButton,
  scanningDisabled,
  processingPickup,
  qrCodeInput,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onCancel}
        className="flex-1 bg-transparent"
      >
        Cancel
      </Button>
      {showScanButton ? (
        <Button
          onClick={onScanQR}
          className="flex-1"
          disabled={scanningDisabled || !qrCodeInput}
        >
          Scan QR Code
        </Button>
      ) : (
        <Button
          className="flex-1"
          onClick={onConfirmPickup}
          disabled={processingPickup}
        >
          {processingPickup ? "Processing..." : "Picked up by customer"}
        </Button>
      )}
    </div>
  );
}
