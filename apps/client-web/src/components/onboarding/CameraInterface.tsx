"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, RotateCcw, SwitchCamera } from "lucide-react";
import Webcam from "react-webcam";

import { Button } from "@ebox/ui/button";

interface CameraInterfaceProps {
  onCapture: (file: File) => void;
  onBack: () => void;
  isUploading?: boolean;
}

export default function CameraInterface({
  onCapture,
  onBack,
  isUploading = false,
}: CameraInterfaceProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setError(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setError(
      "Failed to access the camera. Please ensure you have given the necessary permissions.",
    );
    console.error("Webcam error:", error);
  }, []);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to File object for better performance
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], "portrait.jpg", { type: "image/jpeg" });
      onCapture(file);
    }
  }, [onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6">
          <Camera className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Camera Access Required
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => window.location.reload()} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
      {/* Camera View */}
      <div className="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          videoConstraints={{
            facingMode: facingMode,
            width: 640,
            height: 480,
          }}
          className="aspect-[4/3] w-full object-cover"
        />

        {/* Camera Guidelines Overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="flex h-full items-center justify-center">
            <div className="relative">
              {/* Face outline guide */}
              <div className="h-64 w-48 rounded-full border-2 border-dashed border-white/80" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
                Position your face here
              </div>
            </div>
          </div>
        </div>

        {/* Camera Switch Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute right-4 top-4 border-white/20 bg-black/50 text-white hover:bg-black/70"
          onClick={switchCamera}
        >
          <SwitchCamera className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-6">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Take Your Portrait Photo
          </h3>
          <p className="text-sm text-gray-600">
            Make sure your face is clearly visible and well-lit
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isUploading}
            className="px-8"
          >
            Back
          </Button>

          <Button
            onClick={capturePhoto}
            disabled={!isCameraReady || isUploading}
            size="lg"
            className="bg-blue-600 px-12 hover:bg-blue-700"
          >
            <Camera className="mr-2 h-5 w-5" />
            {isUploading ? "Processing..." : "Capture Photo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
