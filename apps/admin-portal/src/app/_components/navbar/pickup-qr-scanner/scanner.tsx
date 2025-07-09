import { useState } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle, QrCode } from "lucide-react";
import { Label } from "recharts";

import { Alert, AlertDescription } from "@ebox/ui/alert";
import { Button } from "@ebox/ui/button";
import { Card, CardContent } from "@ebox/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";
import { toast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";

import { api } from "~/trpc/react";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuccessStateProps {
  orderId: number;
  customerName: string;
}

interface ErrorStateProps {
  message: string;
}

interface ActionButtonsProps {
  onCancel: () => void;
  onScanQR: () => void;
  onConfirmPickup: () => void;
  showScanButton: boolean;
  scanningDisabled: boolean;
  processingPickup: boolean;
  qrCodeInput: string;
}

interface QRInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface UserInfoProps {
  userInfo: {
    portraitUrl: string;
    firstName: string;
    lastName: string;
    orderId: number;
  };
}

export default function PickupQRScanner({ isOpen, onClose }: QRScannerProps) {
  const [qrCodeInput, setQrCodeInput] = useState("");

  const {
    mutate: authenticatePickupToken,
    reset: resetScanToken,
    isPending: scanningToken,
    isSuccess: successfullyScannedToken,
    data: userInfo,
  } = api.auth.authenticateAuthorizedPickupToken.useMutation({
    onError: (e) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: e.message,
      });
    },
  });

  const {
    reset: resetOrderPickUp,
    mutate: processOrderPickup,
    isPending: processingOrderPickUp,
    isSuccess: successfullyPickedUpOrder,
  } = api.orders.markOrderAsPickedUp.useMutation({
    onError: (e) => {
      toast({
        variant: "destructive",
        title: "Operation Unsuccessful!",
        description: e.message,
      });
    },
  });

  const handleClose = () => {
    setQrCodeInput("");
    resetOrderPickUp();
    resetScanToken();
    onClose();
  };

  const handleQRCodeChange = (value: string) => {
    setQrCodeInput(value);
  };

  const processQRCode = () => {
    if (qrCodeInput.trim().length === 0) return;
    authenticatePickupToken({
      pickupToken: qrCodeInput,
    });
  };

  const processPickup = () => {
    if (userInfo?.authorized !== true) return;
    const { orderId, customerId } = userInfo;
    processOrderPickup({
      orderId,
      customerId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Package Pickup Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success State */}
          {successfullyPickedUpOrder && userInfo?.authorized && (
            <SuccessState
              orderId={userInfo.orderId}
              customerName={`${userInfo.firstName} ${userInfo.lastName}`}
            />
          )}

          {/* Only show other states if not in success state */}
          {!successfullyPickedUpOrder && (
            <>
              {/* Loading State */}
              {scanningToken && <LoadingState />}

              {/* Error State */}
              {userInfo?.authorized === false && (
                <ErrorState message={userInfo.message} />
              )}

              {/* User Information Display */}
              {userInfo?.authorized && <UserInfoDisplay userInfo={userInfo} />}

              {/* QR Code Input */}
              <QRInput
                value={qrCodeInput}
                onChange={handleQRCodeChange}
                disabled={userInfo?.authorized}
              />

              {/* Action Buttons */}
              <ActionButtons
                onCancel={handleClose}
                onScanQR={processQRCode}
                onConfirmPickup={processPickup}
                showScanButton={!successfullyScannedToken}
                scanningDisabled={scanningToken}
                processingPickup={processingOrderPickUp}
                qrCodeInput={qrCodeInput}
              />

              <p className="text-center text-xs text-muted-foreground">
                Enter the QR code to view package details
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Success State Component
function SuccessState({ orderId, customerName }: SuccessStateProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">
              Pickup Successful!
            </h3>
            <p className="text-green-700">
              Order <span className="font-mono font-medium">{orderId}</span> has
              been marked as picked up by {customerName}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Looking up package information...</AlertDescription>
    </Alert>
  );
}

// Error State Component
function ErrorState({ message }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="font-medium">{message}</AlertDescription>
    </Alert>
  );
}

// Action Buttons Component
function ActionButtons({
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

// QR Input Component
function QRInput({ value, onChange, disabled = false }: QRInputProps) {
  return (
    <div className="space-y-2">
      <Label>QR Code</Label>
      <Input
        id="qr-input"
        type="text"
        placeholder="Enter QR code..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
        disabled={disabled}
        autoFocus
      />
    </div>
  );
}

// User Information Display Component
function UserInfoDisplay({ userInfo }: UserInfoProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Portrait Image */}
          <div className="flex justify-center">
            <div className="relative h-96 w-80 overflow-hidden rounded-lg border-2 border-border bg-muted shadow-xl">
              <Image
                src={userInfo.portraitUrl || "/placeholder.svg"}
                alt={`${userInfo.firstName} ${userInfo.lastName}`}
                fill
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3 text-center">
            <div>
              <Label className="text-xs text-muted-foreground">
                Legal Name
              </Label>
              <p className="text-lg font-semibold">{`${userInfo.firstName} ${userInfo.lastName}`}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Order ID</Label>
              <p className="inline-block rounded border bg-background px-2 py-1 font-mono text-sm">
                {userInfo.orderId}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
