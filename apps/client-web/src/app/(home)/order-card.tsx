import Image from "next/image";
import image1 from "public/image1.jpg";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import { Separator } from "@ebox/ui/separator";

interface Order {
  date_ordered: string;
  total: number;
  ship_to: string;
  order_number: string;
}
export default function OrderCard({
  date_ordered,
  total,
  ship_to,
  order_number,
}: Order) {
  return (
    <Card className="my-4">
      <CardHeader className="px-6 py-4">
        <div className="flex justify-between text-sm">
          <div className="flex w-1/4 flex-col">
            <p className="text-sm text-[#575959]">ORDER PLACED</p>
            <p className="text-sm font-medium text-[#575959]">{date_ordered}</p>
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
              {ship_to}
            </p>
          </div>
          <div className="flex w-1/4 flex-col">
            <p className="place-self-end truncate text-sm text-[#575959]">
              ORDER #: {order_number}
            </p>
            <p className="place-self-end text-sm font-medium text-[#575959]">
              View invoice
            </p>
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
                  Your package is available for pickup at EBOX Home
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
            <Button className="bg-[#00698F] text-white">Track package</Button>
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
  );
}
