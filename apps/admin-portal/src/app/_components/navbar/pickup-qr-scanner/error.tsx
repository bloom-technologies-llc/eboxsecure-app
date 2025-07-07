"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@ebox/ui/alert";

interface ErrorStateProps {
  message: string;
}

// Error State Component
export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="font-medium">{message}</AlertDescription>
    </Alert>
  );
}
