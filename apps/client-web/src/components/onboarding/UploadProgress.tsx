"use client";

import { CheckCircle, Upload, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  isComplete: boolean;
  error?: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

export default function UploadProgress({
  progress,
  isUploading,
  isComplete,
  error,
  onCancel,
  onRetry,
}: UploadProgressProps) {
  if (error) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Upload Failed
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
        </div>
        <div className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Upload Complete!
          </h3>
          <p className="text-gray-600">
            Your portrait photo has been successfully uploaded and verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Upload className="h-8 w-8 animate-pulse text-blue-500" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Uploading Your Photo
        </h3>
        <p className="text-gray-600">
          Please wait while we securely upload your portrait photo
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Upload Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-medium text-gray-900">
            {isUploading ? "Uploading..." : "Preparing..."}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Time Remaining</div>
          <div className="font-medium text-gray-900">
            {progress > 0
              ? `${Math.max(1, Math.round((100 - progress) / 10))}s`
              : "Calculating..."}
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="text-center">
          <Button variant="outline" onClick={onCancel} className="px-8">
            Cancel Upload
          </Button>
        </div>
      )}
    </div>
  );
}
