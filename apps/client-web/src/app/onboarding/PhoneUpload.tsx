"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

import { Button } from "@ebox/ui/button";
import { Input } from "@ebox/ui/input";

interface PhoneUploadProps {
  onPhotoUploaded: () => void;
  onBack: () => void;
}

export default function PhoneUpload({
  onPhotoUploaded,
  onBack,
}: PhoneUploadProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkUploadStatus, setCheckUploadStatus] = useState(false);

  const { data } = api.onboarding.checkUploadStatus.useQuery({
    enabled: checkUploadStatus,
    refetchInterval: 2500,
  });
  const { mutate: createPhoneUploadLinkKey } =
    api.onboarding.createPhoneUploadLinkKey.useMutation({
      onSuccess: () => {},
    });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      // mutation to send selfie link
      onPhotoUploaded(); // In a real app, you might want to confirm the photo was actually taken
    } catch (err) {
      setError("Failed to send the selfie link. Please try again.");
      console.error("Error sending selfie link:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="tel"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSending}>
        {isSending ? "Sending..." : "Send Selfie Link"}
      </Button>
      <Button variant="outline" className="w-full" onClick={onBack}>
        Go Back
      </Button>
    </form>
  );
}
