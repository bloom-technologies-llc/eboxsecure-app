"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@ebox/ui/alert";
import { Button } from "@ebox/ui/button";

export default function VirtualAddressBanner() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: virtualAddress, isLoading } =
    api.user.getVirtualAddress.useQuery();
  const utils = api.useUtils();

  const createVirtualAddress = api.user.createVirtualAddress.useMutation({
    onMutate: () => {
      setIsCreating(true);
    },
    onSuccess: () => {
      void utils.user.getVirtualAddress.invalidate();
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  if (isLoading) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertTitle className="text-blue-900">Loading...</AlertTitle>
      </Alert>
    );
  }

  if (!virtualAddress) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <AlertTitle className="text-blue-900">
          You have not yet created your virtual address. Create one now
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Virtual addresses allow you to send packages directly to EboxSecure
          facilities without the need for one of our integrations. Use this
          virtual address in the secondary address of the shipping details.
        </AlertDescription>
        <Button
          className="mt-3 bg-blue-600 hover:bg-blue-700"
          onClick={() => createVirtualAddress.mutate()}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Now"
          )}
        </Button>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <AlertTitle className="text-green-900">Your Virtual Address</AlertTitle>
      <AlertDescription>
        <div className="my-3 rounded-md bg-white p-3 text-center">
          <span className="text-lg font-bold text-gray-900">
            {virtualAddress}
          </span>
        </div>
        <div className="text-sm text-green-800">
          <p className="mb-2 font-medium">Example Usage:</p>
          <div className="rounded-md bg-white p-3 text-xs text-gray-700">
            <div className="mb-2">
              <span className="font-semibold">Primary Address:</span>
              <br />
              John Doe
              <br />
              123 Main Street
              <br />
              Anytown, ST 12345
            </div>
            <div>
              <span className="font-semibold">Secondary Address:</span>
              <br />
              {virtualAddress}
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
