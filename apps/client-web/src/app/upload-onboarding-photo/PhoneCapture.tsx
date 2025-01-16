"use client";

/**
 * NOTE: this is a nearly exact copy of the WebcamCapture component
 */
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import Webcam from "react-webcam";

import { Button } from "@ebox/ui/button";

export default function PhoneCapture() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const uploadKey = searchparams.get("uploadKey");

  const { data: isValid, isLoading: isUploadKeyValidLoading } =
    api.onboarding.isUploadKeyValid.useQuery({
      uploadKey: uploadKey ?? "",
    });

  const { data: isOnboarded, isLoading: isOnboardedLoading } =
    api.onboarding.isOnboardedUnauthed.useQuery(
      {
        uploadKey: uploadKey ?? "",
      },
      { enabled: isValid !== undefined },
    );
  if (isOnboarded) {
    router.push("/");
  }

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const { mutate: uploadPortrait } =
    api.onboarding.uploadPortraitFromUnauthedClient.useMutation({
      onSuccess: () => {
        setUploadComplete(true);
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
      uploadPortrait({ file: capturedImage, uploadKey: uploadKey ?? "" });
    }
  }, [capturedImage]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{error}</p>
        <p>Please refresh this page and try again.</p>
      </div>
    );
  }

  if (uploadComplete) {
    return (
      <h1>
        Upload complete! You may exit this page and resume onboarding on your
        original device.
      </h1>
    );
  }

  if (isUploadKeyValidLoading || isOnboardedLoading) {
    return <div>Loading...</div>;
  }
  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1>Uh oh! </h1>
        <p>
          This page is not valid. If you are seeing this message after clicking
          a link from an EboxSecure text, please contact support after trying
          again.
        </p>
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
    </div>
  );
}
