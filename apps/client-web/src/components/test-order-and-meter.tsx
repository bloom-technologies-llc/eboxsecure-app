"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";

export default function TestOrderAndMeter() {
  const { user } = useUser();

  const [deliveredDate, setDeliveredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [pickedUpAt, setPickedUpAt] = useState(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split("T")[0];
  });

  const [processedAt, setProcessedAt] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [stripeCustomerId, setStripeCustomerId] = useState("");

  // Set default Stripe customer ID from user's private metadata
  useEffect(() => {
    if (user && (user as any).privateMetadata?.stripeCustomerId) {
      setStripeCustomerId(
        (user as any).privateMetadata.stripeCustomerId as string,
      );
    }
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveredDate,
          pickedUpAt,
          processedAt,
          stripeCustomerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order and meter event");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Test Order Creation & Overage Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="deliveredDate">Delivered Date</Label>
              <Input
                id="deliveredDate"
                type="date"
                value={deliveredDate}
                onChange={(e) => setDeliveredDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="pickedUpAt">Picked Up At</Label>
              <Input
                id="pickedUpAt"
                type="date"
                value={pickedUpAt}
                onChange={(e) => setPickedUpAt(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="processedAt">Processed At</Label>
              <Input
                id="processedAt"
                type="date"
                value={processedAt}
                onChange={(e) => setProcessedAt(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
              <Input
                id="stripeCustomerId"
                type="text"
                value={stripeCustomerId}
                onChange={(e) => setStripeCustomerId(e.target.value)}
                placeholder="cus_..."
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">Auto-populated Order Details:</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
              <div>Vendor Order ID: VENDOR_1751645702071_0</div>
              <div>Total: $20.00</div>
              <div>Shipped Location ID: 2</div>
              <div>Customer ID: Current user's Clerk ID</div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Order & Calculate Overage"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4">
            <div className="text-red-600">{error}</div>
          </div>
        )}

        {result && (
          <div className="mt-4 rounded border border-green-200 bg-green-50 p-4">
            <div className="text-green-600">
              <strong>Success!</strong> Order created with ID:{" "}
              {result.order?.id}
              {result.calculation && (
                <div className="mt-4 space-y-2">
                  <strong>Holding Calculation:</strong>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div>
                      Subscription Tier: {result.calculation.tier || "Unknown"}
                    </div>
                    <div>
                      Holding Allowance: {result.calculation.allowance} days
                    </div>
                    <div>
                      Actual Holding Days: {result.calculation.holdingDays}
                    </div>
                    <div
                      className={
                        result.calculation.overageDays > 0
                          ? "font-bold text-red-600"
                          : "font-bold"
                      }
                    >
                      Overage Days: {result.calculation.overageDays}
                    </div>
                  </div>
                </div>
              )}
              {result.meterEvent ? (
                <div className="mt-2">
                  <strong className="text-red-600">Meter Event:</strong> Created
                  for {result.calculation?.overageDays} overage days
                </div>
              ) : result.calculation?.overageDays === 0 ? (
                <div className="mt-2">
                  <strong className="text-green-600">No Overage:</strong>{" "}
                  Package picked up within allowance - no billing
                </div>
              ) : (
                <div className="mt-2">
                  <strong>No Meter Event:</strong> Missing pickup date or other
                  required data
                </div>
              )}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">
                  View raw response
                </summary>
                <pre className="mt-2 rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
