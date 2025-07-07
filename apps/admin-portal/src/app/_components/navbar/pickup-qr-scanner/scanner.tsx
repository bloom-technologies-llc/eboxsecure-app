import { useState } from "react";
import { QrCode } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";
import { toast } from "@ebox/ui/hooks/use-toast";

import { api } from "~/trpc/react";
import ActionButtons from "./action-buttons";
import { ErrorState } from "./error";
import { LoadingState } from "./loading";
import QRInput from "./qr-input";
import { SuccessState } from "./success";
import UserInfoDisplay from "./user-info";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PickupQRScanner({ isOpen, onClose }: QRScannerProps) {
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
