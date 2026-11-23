import { useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export interface PhonePortraitUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadedImageUrl: string | null;
  error: string | null;
  isComplete: boolean;
}

/**
 * Unauthenticated counterpart to usePortraitUpload for the mobile phone-upload
 * flow. Uploads to the `phonePortraitUpload` route (authorized by uploadKey
 * rather than a Clerk session) and returns the resulting URL so the caller can
 * persist it via onboarding.uploadPortraitFromUnauthedClient.
 */
export function usePhonePortraitUpload(uploadKey: string) {
  const [state, setState] = useState<PhonePortraitUploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadedImageUrl: null,
    error: null,
    isComplete: false,
  });

  const { startUpload } = useUploadThing("phonePortraitUpload", {
    onClientUploadComplete: (res) => {
      const fileUrl = res?.[0]?.url;
      if (fileUrl) {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          uploadedImageUrl: fileUrl,
          error: null,
          isComplete: true,
        }));
      }
    },
    onUploadError: (error: Error) => {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: error.message || "Upload failed. Please try again.",
        isComplete: false,
      }));
    },
    onUploadBegin: () => {
      setState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
        isComplete: false,
      }));
    },
    onUploadProgress: (progress) => {
      setState((prev) => ({
        ...prev,
        uploadProgress: progress,
      }));
    },
  });

  const uploadPortrait = async (file: File): Promise<string | null> => {
    if (!file) {
      setState((prev) => ({ ...prev, error: "No file selected" }));
      return null;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setState((prev) => ({
        ...prev,
        error: "Invalid file type. Please select a JPEG, PNG, or WebP image.",
      }));
      return null;
    }

    // Validate file size (4MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxSize) {
      setState((prev) => ({
        ...prev,
        error: "File too large. Please select an image smaller than 4MB.",
      }));
      return null;
    }

    try {
      const res = await startUpload([file], { uploadKey });
      return res?.[0]?.url ?? null;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        isComplete: false,
      }));
      return null;
    }
  };

  const resetUpload = () => {
    setState({
      isUploading: false,
      uploadProgress: 0,
      uploadedImageUrl: null,
      error: null,
      isComplete: false,
    });
  };

  return {
    ...state,
    uploadPortrait,
    resetUpload,
  };
}
