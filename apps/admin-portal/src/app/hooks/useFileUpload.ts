import { useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";

import { useToast } from "@ebox/ui/hooks/use-toast";

import type { OurFileRouter } from "~/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { startUpload } = useUploadThing("commentAttachment", {
    onClientUploadComplete: (res) => {
      if (res) {
        const newFiles = res.map((file) => ({
          name: file.name,
          url: file.ufsUrl,
          size: file.size,
          type: file.type,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
      setIsUploading(false);
      toast({
        description: `${res?.length} file(s) uploaded successfully!`,
      });
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.url !== url));
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file size (64MB limit)
    const invalidFiles = files.filter((file) => file.size > 64 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Files must be smaller than 64MB. ${invalidFiles.length} file(s) exceeded the limit.`,
      });
      return;
    }

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "audio/mpeg",
    ];

    const invalidTypeFiles = files.filter(
      (file) => !allowedTypes.includes(file.type),
    );
    if (invalidTypeFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Only PDF, images (PNG, JPEG, GIF, WebP), and MP3 files are allowed. ${invalidTypeFiles.length} file(s) have invalid types.`,
      });
      return;
    }

    await startUpload(files);
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    isUploading,
    uploadFiles,
    removeFile,
    clearAllFiles,
  };
}
