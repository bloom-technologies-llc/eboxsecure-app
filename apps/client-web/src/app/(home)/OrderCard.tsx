"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/trpc/react";
import image1 from "public/image1.jpg";

import type { RouterOutput } from "@ebox/client-api";
import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader } from "@ebox/ui/card";
import { Separator } from "@ebox/ui/separator";

import ShareOrderDialog from "./ShareOrderDialog";
import ViewQRCodeDialog from "./ViewQRCodeDialog";

export default function OrderCard({
  id,
  vendorOrderId,
  total,
  shippedLocation,
  deliveredDate,
  createdAt,
  pickedUpAt,
  directlyOwned,
}: RouterOutput["order"]["getAllOrders"][number]) {
  const [fetchQrCode, setFetchQrCode] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const alreadyPickedUp = Boolean(pickedUpAt);
  const { data: qrCode } = api.auth.getAuthorizedPickupToken.useQuery(
    { orderId: id },
    {
      enabled: fetchQrCode && !alreadyPickedUp,
      refetchInterval: 1000 * 60 * 15,
    }, // expires after 15 minutes
  );

  return (
    <>
      {qrCode && fetchQrCode && (
        <ViewQRCodeDialog
          qrCode={qrCode}
          onClose={() => setFetchQrCode(false)}
        />
      )}

      {showShareDialog && (
        <ShareOrderDialog
          orderId={id}
          vendorOrderId={vendorOrderId}
          onClose={() => setShowShareDialog(false)}
        />
      )}

      <Card className={"my-4"} key={id}>
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between text-sm">
            <div className="flex w-1/4 flex-col">
              <p className="text-sm text-[#575959]">ORDER PLACED</p>
              <p className="text-sm font-medium text-[#575959]">
                {createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className="flex w-1/4 flex-col">
              <p className="text-sm text-[#575959]">TOTAL</p>
              <p className="text-sm font-medium text-[#575959]">
                {total.toFixed(2)}
              </p>
            </div>
            <div className="flex w-1/4 flex-col">
              <p className="text-sm text-[#575959]">SHIP TO</p>
              <p className="truncate text-sm font-medium text-[#575959]">
                {shippedLocation.address}
              </p>
            </div>
            <div className="flex w-1/4 flex-col">
              <p className="place-self-end truncate text-sm text-[#575959]">
                ORDER #: {vendorOrderId}
              </p>
              <p className="place-self-end text-sm font-medium text-[#575959]">
                View invoice
              </p>
              {!directlyOwned && (
                <span className="text-smfont-semibold mt-5 place-self-end rounded bg-yellow-200 px-2 py-0.5 text-yellow-700">
                  Shared
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="flex">
            <div className="w-4/5">
              <div className="flex flex-col">
                <div className="flex flex-col pb-6">
                  <p className="">Arriving tomorrow 10pm</p>
                  <p className="text-[#575959]">
                    Your package is available for pickup at{" "}
                    {shippedLocation.name}
                  </p>
                </div>

                <div className="flex gap-x-6">
                  <Image
                    src={image1}
                    alt="image 1"
                    height={100}
                    width={100}
                    className="rounded-md"
                  />
                  <p className="">Apple Airpods Max</p>
                </div>
              </div>
            </div>
            <div className="my-auto flex w-1/5 flex-col gap-y-3">
              {deliveredDate ? (
                <Button
                  className="bg-[#00698F] text-white"
                  onClick={() => setFetchQrCode(true)}
                  disabled={alreadyPickedUp}
                >
                  {alreadyPickedUp ? `Picked Up` : `View QR Code`}
                </Button>
              ) : (
                <Button className="bg-[#00698F] text-white">
                  Track package
                </Button>
              )}
              {directlyOwned && (
                <Button
                  className="bg-[#00698F] text-white"
                  onClick={() => setShowShareDialog(true)}
                >
                  Share Order
                </Button>
              )}
              <Button className="border border-[#333333] bg-[#ffffff] text-[#333333]">
                View order
              </Button>
              <Button className="border border-[#333333] bg-[#ffffff] text-[#333333]">
                Pickup info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
