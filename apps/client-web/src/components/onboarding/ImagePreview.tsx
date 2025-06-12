"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, RotateCcw } from "lucide-react";

import { Button } from "@ebox/ui/button";

interface ImagePreviewProps {
  imageFile: File;
  onRetake: () => void;
  onConfirm: () => void;
  isUploading?: boolean;
}

export default function ImagePreview({
  imageFile,
  onRetake,
  onConfirm,
  isUploading = false,
}: ImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    return URL.createObjectURL(imageFile);
  });
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
      {/* Image Preview */}
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-100">
          <Image
            src={imageUrl}
            alt="Portrait preview"
            fill
            className="object-cover"
            onLoad={() => {
              // Clean up the object URL after the image loads
              setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
            }}
          />
        </div>

        {/* Quality Indicator */}
        <div className="absolute left-4 top-4">
          <div className="flex items-center space-x-1 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
            <Check className="h-4 w-4" />
            <span>Good Quality</span>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="bg-gray-50 p-6">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Review Your Photo
          </h3>
          <p className="text-sm text-gray-600">
            Make sure you're happy with how you look before continuing
          </p>
        </div>

        {/* Image Details */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">File Size:</span>
              <span className="ml-2 font-medium">
                {(imageFile.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            <div>
              <span className="text-gray-500">Format:</span>
              <span className="ml-2 font-medium uppercase">
                {imageFile.type.split("/")[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onRetake}
            disabled={isUploading}
            className="px-8"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isUploading}
            size="lg"
            className="bg-green-600 px-12 hover:bg-green-700"
          >
            <Check className="mr-2 h-5 w-5" />
            {isUploading ? "Uploading..." : "Use This Photo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
