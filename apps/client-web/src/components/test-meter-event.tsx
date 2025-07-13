"use client";

import { useState } from "react";

import { Button } from "@ebox/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";

export default function TestMeterEvent() {
  const [eventName, setEventName] = useState("alpaca_ai_tokens");
  const [customerId, setCustomerId] = useState("");
  const [value, setValue] = useState("25");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-meter-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          customerId,
          value: parseInt(value),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meter event");
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Meter Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="eventName">Event Name</Label>
            <Input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g., alpaca_ai_tokens"
              required
            />
          </div>

          <div>
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="cus_..."
              required
            />
          </div>

          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="25"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Meter Event"}
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
              <strong>Success!</strong> Meter event created with ID:{" "}
              {result.meterEvent?.id}
              <pre className="mt-2 rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
