"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";

import CameraInterface from "../../components/onboarding/CameraInterface";
import ImagePreview from "../../components/onboarding/ImagePreview";
import UploadProgress from "../../components/onboarding/UploadProgress";
import { usePhonePortraitUpload } from "../../hooks/usePhonePortraitUpload";

type UploadStep = "camera" | "preview" | "uploading" | "success";

export default function PhoneCapture() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const uploadKey = searchparams.get("uploadKey") ?? "";

  const [currentStep, setCurrentStep] = useState<UploadStep>("camera");
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: isValid, isLoading: isUploadKeyValidLoading } =
    api.onboarding.isUploadKeyValid.useQuery({ uploadKey });

  const { data: isOnboarded, isLoading: isOnboardedLoading } =
    api.onboarding.isOnboardedUnauthed.useQuery(
      { uploadKey },
      { enabled: isValid !== undefined },
    );
  if (isOnboarded) {
    router.push("/");
  }

  // UploadThing hook for the unauthenticated phone-upload flow
  const {
    isUploading,
    uploadProgress,
    error: uploadError,
    uploadPortrait,
    resetUpload,
  } = usePhonePortraitUpload(uploadKey);

  // Persist the uploaded URL to the customer account; this also flips the
  // OnboardingPhoneUploadLink to completed so the desktop wait page redirects.
  const { mutate: savePhoto, isPending: isSaving } =
    api.onboarding.uploadPortraitFromUnauthedClient.useMutation({
      onSuccess: () => setCurrentStep("success"),
      onError: (error) => setSaveError(error.message),
    });

  const handlePhotoCapture = (file: File) => {
    setCapturedImage(file);
    setCurrentStep("preview");
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setCurrentStep("camera");
    setSaveError(null);
    resetUpload();
  };

  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;
    setSaveError(null);
    setCurrentStep("uploading");
    const url = await uploadPortrait(capturedImage);
    if (url) {
      savePhoto({ photoLink: url, uploadKey });
    }
  };

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

  const error = saveError ?? uploadError;

  return (
    <div className="w-full max-w-md px-4">
      {currentStep === "camera" && (
        <CameraInterface
          onCapture={handlePhotoCapture}
          onBack={handleRetakePhoto}
          isUploading={isUploading}
        />
      )}

      {currentStep === "preview" && capturedImage && (
        <ImagePreview
          imageFile={capturedImage}
          onRetake={handleRetakePhoto}
          onConfirm={handleConfirmPhoto}
          isUploading={isUploading || isSaving}
        />
      )}

      {currentStep === "uploading" && (
        <UploadProgress
          progress={uploadProgress}
          isUploading={isUploading || isSaving}
          isComplete={false}
          error={error}
          onCancel={handleRetakePhoto}
          onRetry={handleConfirmPhoto}
        />
      )}

      {currentStep === "success" && (
        <h1>
          Upload complete! You may exit this page and resume onboarding on your
          original device.
        </h1>
      )}
    </div>
  );
}
