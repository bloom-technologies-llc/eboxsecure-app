"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import WebcamCapture from "./WebcamCapture";

export default function OnboardingPage() {
  const [useWebcam, setUseWebcam] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const router = useRouter();

  const { mutate: createPhoneUploadLinkKey, isPending } =
    api.onboarding.createPhoneUploadLinkKey.useMutation({
      onSuccess: () => {
        router.push("/onboarding/wait-phone-upload");
      },
    });

  const handlePhotoUploaded = () => {
    setPhotoUploaded(true);
  };

  if (photoUploaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Photo Uploaded</CardTitle>
            <CardDescription>
              Your photo has been successfully uploaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/")}>
              Finish onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Upload Your Photo</CardTitle>
          <CardDescription>
            Choose a method to upload your portrait photo. This photo will be
            used to verify your identity at the time of pickup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!useWebcam ? (
            <div className="space-y-4">
              <Button className="w-full" onClick={() => setUseWebcam(true)}>
                Use Webcam
              </Button>
              <Button
                className="w-full"
                onClick={() => createPhoneUploadLinkKey()}
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send Link to Phone"}
              </Button>
            </div>
          ) : (
            <WebcamCapture
              onPhotoUploaded={handlePhotoUploaded}
              onBack={() => setUseWebcam(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
