"use client";

import { useQRCode } from "next-qrcode";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";

const ViewQRCodeDialog = ({
  qrCode,
  onClose,
}: {
  qrCode: string;
  onClose: () => void;
}) => {
  const { Canvas } = useQRCode();
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>Order QR Code</DialogTitle>
          <DialogDescription>
            Show this QR Code to an EBoxSecure associate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <Canvas
            text={qrCode}
            options={{
              errorCorrectionLevel: "M",
              margin: 3,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewQRCodeDialog;
