import { useState } from "react";
import Image from "next/image";
import { AlertCircle, QrCode } from "lucide-react";

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
import { Label } from "@ebox/ui/label";

import { api } from "~/trpc/react";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PickupQRScanner({ isOpen, onClose }: QRScannerProps) {
  const [qrCodeInput, setQrCodeInput] = useState("");
  const {
    mutate: authenticatePickupToken,
    reset,
    isPending: scanningQrCode,
    isSuccess: successfullyScannedQrCode,
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

  const { mutate: processOrderPickup, isPending: processingPickUp } =
    api.orders.markOrderAsPickedUp.useMutation({
      onError: (e) => {
        toast({
          variant: "destructive",
          title: "Operation Unsuccessful!",
          description: e.message,
        });
      },
      onSuccess: () => {
        if (userInfo?.authorized !== true) return;
        const orderId = userInfo.orderId;
        toast({
          variant: "success",
          title: "Order successfully picked up!",
          description: `Order ${orderId} has been marked as picked up.`,
        });
        handleClose();
      },
    });

  const handleClose = () => {
    setQrCodeInput("");
    reset();
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
          {/* Loading State */}
          {scanningQrCode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Looking up package information...
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {userInfo?.authorized === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {userInfo.message}
              </AlertDescription>
            </Alert>
          )}

          {/* User Information Display */}
          {userInfo?.authorized && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Portrait Image */}
                  <div className="flex justify-center">
                    <div className="relative h-96 w-80 overflow-hidden rounded-lg border-2 border-border bg-muted shadow-xl">
                      <Image
                        src={userInfo.portraitUrl}
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
                      <p className="text-lg font-semibold">
                        {`${userInfo.firstName} ${userInfo.lastName}`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Order ID&nbsp;
                      </Label>
                      <p className="inline-block rounded border bg-background px-2 py-1 font-mono text-sm">
                        {userInfo.orderId}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code Input */}
          <div className="space-y-2">
            <Label htmlFor="qr-input">QR Code</Label>
            <Input
              id="qr-input"
              type="text"
              placeholder="Enter QR code..."
              value={qrCodeInput}
              onChange={(e) => handleQRCodeChange(e.target.value)}
              className="font-mono"
              disabled={userInfo?.authorized}
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            {!successfullyScannedQrCode ? (
              <Button
                onClick={processQRCode}
                className="flex-1"
                disabled={scanningQrCode || !qrCodeInput}
              >
                Scan QR Code
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={processPickup}
                disabled={processingPickUp}
              >
                Picked up by customer
              </Button> // TODO: Implement logic to mark order as picked up
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Enter the QR code to view package details
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
