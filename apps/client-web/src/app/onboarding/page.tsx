import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

import PortraitPhotoUpload from "./PortraitPhotoUpload";

export default async function Page() {
  const isOnboarded = await api.onboarding.isOnboarded();
  if (isOnboarded) {
    redirect("/");
  }
  return (
    <div className="flex h-screen w-full flex-col items-center gap-8 pt-24">
      <PortraitPhotoUpload />
    </div>
  );
}
