"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, UserCheck } from "lucide-react";

// import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";

import CameraInterface from "../../components/onboarding/CameraInterface";
import ImagePreview from "../../components/onboarding/ImagePreview";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import UploadProgress from "../../components/onboarding/UploadProgress";
import { usePortraitUpload } from "../../hooks/usePortraitUpload";

type UploadStep = "landing" | "camera" | "preview" | "uploading" | "success";

export default function PortraitPhotoUpload() {
  const [currentStep, setCurrentStep] = useState<UploadStep>("landing");
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const router = useRouter();

  // UploadThing hook for handling portrait uploads
  const {
    isUploading,
    uploadProgress,
    uploadedImageUrl,
    error,
    isComplete,
    uploadPortrait,
    resetUpload,
  } = usePortraitUpload();

  // TODO: Re-enable when Twilio integration is fixed
  // const { mutate: createPhoneUploadLinkKey, isPending } =
  //   api.onboarding.createPhoneUploadLinkKey.useMutation({
  //     onSuccess: () => {
  //       router.push("/onboarding/wait-phone-upload");
  //     },
  //   });

  const handleStartCamera = () => {
    setCurrentStep("camera");
  };

  const handlePhotoCapture = (file: File) => {
    setCapturedImage(file);
    setCurrentStep("preview");
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setCurrentStep("camera");
    resetUpload();
  };

  const handleConfirmPhoto = async () => {
    if (capturedImage) {
      setCurrentStep("uploading");
      await uploadPortrait(capturedImage);
    }
  };

  const handleUploadComplete = () => {
    setCurrentStep("success");
    // Auto-redirect after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleBack = () => {
    resetUpload();
    setCapturedImage(null);
    setCurrentStep("landing");
  };

  const handleContinue = () => {
    router.push("/");
  };

  // Monitor upload completion
  if (isComplete && currentStep === "uploading") {
    handleUploadComplete();
  }

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={3}
      title="Verify Your Identity"
      description="Take a portrait photo to complete your account setup. This helps us verify your identity when you pick up your packages."
    >
      {currentStep === "landing" && (
        <div className="text-center">
          {/* Hero Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <Camera className="h-12 w-12 text-blue-600" />
          </div>

          {/* Instructions */}
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Portrait Photo Requirements
            </h2>

            <div className="grid gap-6 text-left md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">✅ Do:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Face the camera directly</li>
                  <li>• Use good lighting</li>
                  <li>• Keep a neutral expression</li>
                  <li>• Remove hats and sunglasses</li>
                  <li>• Ensure your face is clearly visible</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">❌ Don't:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Use filters or effects</li>
                  <li>• Include other people</li>
                  <li>• Use old photos</li>
                  <li>• Block your face</li>
                  <li>• Use low-quality images</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <Button
              onClick={handleStartCamera}
              size="lg"
              className="mx-auto w-full max-w-md bg-blue-600 py-6 text-lg hover:bg-blue-700"
            >
              <Camera className="mr-3 h-6 w-6" />
              Take Portrait Photo
            </Button>

            {/* TODO: Re-enable when Twilio integration is fixed */}
            {/* <Button
              variant="outline"
              onClick={() => createPhoneUploadLinkKey()}
              disabled={isPending}
              size="lg"
              className="w-full max-w-md mx-auto text-lg py-6"
            >
              <Smartphone className="w-6 h-6 mr-3" />
              {isPending ? "Sending..." : "Send Link to Phone"}
            </Button> */}
          </div>

          {/* Security Notice */}
          <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <UserCheck className="mr-2 inline h-5 w-5" />
            Your photo is encrypted and stored securely. It will only be used
            for identity verification during package pickup.
          </div>
        </div>
      )}

      {currentStep === "camera" && (
        <CameraInterface
          onCapture={handlePhotoCapture}
          onBack={handleBack}
          isUploading={isUploading}
        />
      )}

      {currentStep === "preview" && capturedImage && (
        <ImagePreview
          imageFile={capturedImage}
          onRetake={handleRetakePhoto}
          onConfirm={handleConfirmPhoto}
          isUploading={isUploading}
        />
      )}

      {currentStep === "uploading" && (
        <UploadProgress
          progress={uploadProgress}
          isUploading={isUploading}
          isComplete={isComplete}
          error={error}
          onCancel={handleBack}
          onRetry={handleConfirmPhoto}
        />
      )}

      {currentStep === "success" && (
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <UserCheck className="h-12 w-12 text-green-600" />
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Account Setup Complete!
            </h2>
            <p className="mb-8 text-gray-600">
              Your portrait photo has been successfully uploaded and verified.
              You can now start using EboxSecure to receive and manage your
              packages.
            </p>

            <Button
              onClick={handleContinue}
              size="lg"
              className="mx-auto w-full max-w-md bg-green-600 py-6 text-lg hover:bg-green-700"
            >
              <UserCheck className="mr-3 h-6 w-6" />
              Continue to Dashboard
            </Button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
}
