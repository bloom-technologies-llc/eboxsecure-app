import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@ebox/ui/alert";

// Loading State Component
export function LoadingState() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Looking up package information...</AlertDescription>
    </Alert>
  );
}
