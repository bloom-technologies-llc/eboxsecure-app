"use client";

import { useState } from "react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import PhoneUpload from "./PhoneUpload";
import WebcamCapture from "./WebcamCapture";

export default function OnboardingPage() {
  const [uploadMethod, setUploadMethod] = useState<"webcam" | "phone" | null>(
    null,
  );
  const [photoUploaded, setPhotoUploaded] = useState(false);

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
            <Button
              className="w-full"
              onClick={() => console.log("Continue onboarding")}
            >
              Continue Onboarding
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
          {!uploadMethod ? (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => setUploadMethod("webcam")}
              >
                Use Webcam
              </Button>
              <Button
                className="w-full"
                onClick={() => setUploadMethod("phone")}
              >
                Send Link to Phone
              </Button>
            </div>
          ) : uploadMethod === "webcam" ? (
            <WebcamCapture
              onPhotoUploaded={handlePhotoUploaded}
              onBack={() => setUploadMethod(null)}
            />
          ) : (
            <PhoneUpload
              onPhotoUploaded={handlePhotoUploaded}
              onBack={() => setUploadMethod(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
