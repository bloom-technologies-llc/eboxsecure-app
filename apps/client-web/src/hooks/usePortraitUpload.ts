import { useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export interface PortraitUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadedImageUrl: string | null;
  error: string | null;
  isComplete: boolean;
}

export function usePortraitUpload() {
  const [state, setState] = useState<PortraitUploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadedImageUrl: null,
    error: null,
    isComplete: false,
  });

  const { startUpload } = useUploadThing("portraitUpload", {
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

  const uploadPortrait = async (file: File) => {
    if (!file) {
      setState((prev) => ({ ...prev, error: "No file selected" }));
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setState((prev) => ({
        ...prev,
        error: "Invalid file type. Please select a JPEG, PNG, or WebP image.",
      }));
      return;
    }

    // Validate file size (4MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxSize) {
      setState((prev) => ({
        ...prev,
        error: "File too large. Please select an image smaller than 4MB.",
      }));
      return;
    }

    try {
      await startUpload([file]);
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
