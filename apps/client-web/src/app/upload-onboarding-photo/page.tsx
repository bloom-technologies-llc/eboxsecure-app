"use client";

import { Suspense } from "react";

import PhoneCapture from "./PhoneCapture";

export default function Page() {
  return (
    <div className="flex h-screen w-full flex-col items-center gap-8 pt-24">
      <Suspense>
        <PhoneCapture />
      </Suspense>
    </div>
  );
}
