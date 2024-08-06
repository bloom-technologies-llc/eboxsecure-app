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

type Order = {
  date_ordered: string;
  total: number;
  ship_to: string;
  order_number: string;
};
export default function OrderCard({
  date_ordered,
  total,
  ship_to,
  order_number,
}: Order) {
  return (
    <Card className="my-4">
      <CardHeader className="px-6 py-2">
        <div className="flex justify-between text-sm">
          <div className="flex w-1/4 flex-col">
            <p>Order Placed</p>
            <p>{date_ordered}</p>
          </div>
          <div className="flex w-1/4 flex-col">
            <p>Total</p>
            <p>{total.toFixed(2)}</p>
          </div>
          <div className="flex w-1/4 flex-col">
            <p>Ship To</p>
            <p className="truncate">{ship_to}</p>
          </div>
          <div className="flex w-1/4 flex-col">
            <p className="place-self-end truncate">Order #: {order_number}</p>
            <p className="place-self-end">View invoice</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex">
          <div className="w-4/5">
            <div className="flex flex-col">
              <p className="text-2xl">Arriving tomorrow 10pm</p>
              <div className="flex">
                <Image src={image1} alt="image 1" height={100} width={100} />
                <p className="text-xl">Apple Airpods Max</p>
              </div>
            </div>
          </div>
          <div className="flex w-1/5 flex-col">
            <Button variant="secondary">Track package</Button>
            <Button variant="primary">View order</Button>
            <Button variant="primary">Pickup location info</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
