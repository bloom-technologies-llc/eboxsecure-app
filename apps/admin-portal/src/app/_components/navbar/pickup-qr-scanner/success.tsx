import { CheckCircle } from "lucide-react";

import { Card, CardContent } from "@ebox/ui/card";

interface SuccessStateProps {
  orderId: number;
  customerName: string;
}
// Success State Component
export function SuccessState({ orderId, customerName }: SuccessStateProps) {
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
