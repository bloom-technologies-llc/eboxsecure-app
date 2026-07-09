"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/trpc/react";

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
  lineItems,
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
                {total === -1 ? "N/A" : total.toFixed(2)}
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
                ORDER #:{" "}
                {vendorOrderId.length > 15
                  ? `${vendorOrderId.slice(0, 15)}...`
                  : vendorOrderId}
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
                  {deliveredDate ? (
                    <>
                      <p className="">Ready for pickup</p>
                      <p className="text-[#575959]">
                        Your package is available for pickup at{" "}
                        {shippedLocation.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="">In transit</p>
                      <p className="text-[#575959]">
                        Your package is on its way to {shippedLocation.name}
                      </p>
                    </>
                  )}
                </div>

                {/*
                  Product image/name come from the order's line items (Shopify).
                  We only render an image when we actually have one — no
                  placeholder stand-in. Scan orders have no line items, so this
                  block is omitted entirely.
                */}
                {lineItems.length > 0 && (
                  <div className="flex flex-col gap-y-4">
                    {lineItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-x-6">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            height={100}
                            width={100}
                            className="h-[100px] w-[100px] rounded-md object-cover"
                          />
                        )}
                        <p className="">
                          {item.title}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </p>
                      </div>
                    ))}
                    {lineItems.length > 3 && (
                      <p className="text-sm text-[#575959]">
                        + {lineItems.length - 3} more{" "}
                        {lineItems.length - 3 === 1 ? "item" : "items"}
                      </p>
                    )}
                  </div>
                )}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
