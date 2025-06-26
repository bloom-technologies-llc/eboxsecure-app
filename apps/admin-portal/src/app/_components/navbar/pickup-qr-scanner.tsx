import { useState } from "react";
import { QrCode } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Card, CardContent } from "@ebox/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";
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
    isPending,
    data: userInfo,
  } = api.auth.authenticateAuthorizedPickupToken.useMutation();

  const handleClose = () => {
    setQrCodeInput("");
    onClose();
  };

  const handleQRCodeChange = (value: string) => {
    setQrCodeInput(value);
  };

  const processQRCode = () => {
    authenticatePickupToken({
      pickupToken: qrCodeInput,
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
          {/* User Information Display */}
          {userInfo?.authorized && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Portrait Image */}
                  <div className="flex justify-center">
                    <div className="relative h-96 w-80 overflow-hidden rounded-lg border-2 border-border bg-muted shadow-xl">
                      <img
                        src={userInfo.portraitUrl}
                        alt={`${userInfo.firstName} ${userInfo.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3 text-center">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Government Name
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
            {!userInfo?.authorized ? (
              <Button
                onClick={processQRCode}
                className="flex-1"
                disabled={isPending || !qrCodeInput}
              >
                Scan QR Code
              </Button>
            ) : (
              <Button className="flex-1">Picked up by customer</Button>
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
