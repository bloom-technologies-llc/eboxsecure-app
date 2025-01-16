"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { api } from "@/trpc/react";
import Webcam from "react-webcam";

import { Button } from "@ebox/ui/button";

// TODO: test with phone
interface WebcamCaptureProps {
  onPhotoUploaded: () => void;
  onBack: () => void;
}

export default function WebcamCapture({
  onPhotoUploaded,
  onBack,
}: WebcamCaptureProps) {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { mutate: uploadPortrait } =
    api.onboarding.uploadPortraitFromAuthedClient.useMutation({
      onSuccess: () => {
        onPhotoUploaded();
      },
    });

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

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const uploadPhoto = useCallback(() => {
    if (capturedImage) {
      uploadPortrait({ file: capturedImage });
    }
  }, [capturedImage, onPhotoUploaded]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {capturedImage ? (
        <div className="space-y-4">
          <div className="relative h-[200px] w-full">
            <Image
              src={capturedImage || "/placeholder.svg"}
              alt="Captured photo"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
          <div className="flex space-x-2">
            <Button className="flex-1" onClick={retakePhoto}>
              Retake Photo
            </Button>
            <Button className="flex-1" onClick={uploadPhoto}>
              Upload Photo
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full rounded-lg"
          />
          {isCameraReady && (
            <Button className="w-full" onClick={capturePhoto}>
              Take Photo
            </Button>
          )}
        </>
      )}
      <Button variant="outline" className="w-full" onClick={onBack}>
        Go Back
      </Button>
    </div>
  );
}
