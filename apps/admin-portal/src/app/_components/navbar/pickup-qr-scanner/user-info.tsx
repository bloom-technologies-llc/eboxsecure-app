import Image from "next/image";
import { Label } from "recharts";

import { Card, CardContent } from "@ebox/ui/card";

interface UserInfoProps {
  userInfo: {
    portraitUrl: string;
    firstName: string;
    lastName: string;
    orderId: number;
  };
}
// User Information Display Component
export default function UserInfoDisplay({ userInfo }: UserInfoProps) {
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
